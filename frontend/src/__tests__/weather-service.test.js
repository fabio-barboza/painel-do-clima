import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { fetchWeather, fetchWeatherAtCoords, WeatherError } from '../services/weather.js'

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }
}

async function capture(fn) {
  return fn().then(
    () => {
      throw new Error('esperava rejeição, mas resolveu')
    },
    (err) => err
  )
}

describe('services/weather.js', () => {
  let fetchSpy
  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(200, {}))
  })
  afterEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  test('usa fetch com cache: "no-store" e URL relativa em dev (base vazia)', async () => {
    await fetchWeather('Curitiba')
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const [url, options] = fetchSpy.mock.calls[0]
    expect(options.cache).toBe('no-store')
    expect(url).toBe('/api/weather?city=Curitiba')
  })

  test('codifica a cidade com encodeURIComponent (acentos e espaços)', async () => {
    await fetchWeather('São Paulo')
    const [url] = fetchSpy.mock.calls[0]
    expect(url).toBe('/api/weather?city=S%C3%A3o%20Paulo')
  })

  test('fetchWeatherAtCoords monta URL com latitude/longitude', async () => {
    await fetchWeatherAtCoords(-25.43, -49.27)
    const [url, options] = fetchSpy.mock.calls[0]
    expect(options.cache).toBe('no-store')
    expect(url).toBe('/api/weather?latitude=-25.43&longitude=-49.27')
  })

  test('usa URL absoluta quando VITE_API_URL está definida', async () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000')
    vi.resetModules()
    const mod = await import('../services/weather.js')
    await mod.fetchWeather('Curitiba')
    const [url] = fetchSpy.mock.calls.at(-1)
    expect(url).toBe('http://localhost:3000/api/weather?city=Curitiba')
  })

  test('404 → WeatherError kind "not-found" com status 404', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse(404, { error: 'não' }))
    const err = await capture(() => fetchWeather('Xanadu'))
    expect(err).toBeInstanceOf(WeatherError)
    expect(err).toMatchObject({ kind: 'not-found', status: 404 })
  })

  test('400 → WeatherError kind "bad-request" com status 400', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse(400, { error: 'ruim' }))
    const err = await capture(() => fetchWeather('Curitiba'))
    expect(err).toMatchObject({ kind: 'bad-request', status: 400 })
  })

  test('500 → WeatherError kind "network" com status 500', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse(500, { error: 'servidor' }))
    const err = await capture(() => fetchWeather('Curitiba'))
    expect(err).toMatchObject({ kind: 'network', status: 500 })
  })

  test('falha de rede → WeatherError kind "network" sem status', async () => {
    fetchSpy.mockRejectedValueOnce(new TypeError('Network request failed'))
    const err = await capture(() => fetchWeather('Curitiba'))
    expect(err).toBeInstanceOf(WeatherError)
    expect(err).toMatchObject({ kind: 'network', status: undefined })
  })

  test('fetch abortado re-lança o AbortError original (não vira WeatherError)', async () => {
    const abortError = new Error('The operation was aborted')
    abortError.name = 'AbortError'
    fetchSpy.mockImplementation((_url, options) => {
      return new Promise((_resolve, reject) => {
        options.signal.addEventListener('abort', () => reject(abortError))
      })
    })

    const controller = new AbortController()
    const promise = fetchWeather('Curitiba', { signal: controller.signal })
    controller.abort()

    const err = await capture(() => promise)
    expect(err).toBe(abortError)
    expect(err.name).toBe('AbortError')
    expect(err).not.toBeInstanceOf(WeatherError)
  })

  test('resolve com o corpo da resposta em sucesso (200)', async () => {
    const envelope = { city: { name: 'Curitiba' }, hourly: { time: [] } }
    fetchSpy.mockResolvedValueOnce(jsonResponse(200, envelope))
    await expect(fetchWeather('Curitiba')).resolves.toEqual(envelope)
  })
})
