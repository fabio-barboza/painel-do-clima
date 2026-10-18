import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { WeatherApiError, fetchWeather } from '../services/weatherApi.js'

const BASE_URL = 'http://api.test.local'

function okResponse(body) {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
  }
}

function errorResponse(status, body) {
  return {
    ok: false,
    status,
    json: () => (body === undefined ? Promise.reject(new SyntaxError('invalid json')) : Promise.resolve(body)),
  }
}

describe('fetchWeather', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', BASE_URL)
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('monta a URL a partir de VITE_API_URL com o parâmetro city', async () => {
    fetch.mockResolvedValue(okResponse({ location: {}, forecast: {} }))
    await fetchWeather({ city: 'São Paulo' })
    expect(fetch).toHaveBeenCalledTimes(1)
    const [url, options] = fetch.mock.calls[0]
    expect(url).toBe(`${BASE_URL}/api/weather?city=S%C3%A3o%20Paulo`)
    expect(options.method).toBe('GET')
  })

  it('usa http://localhost:3000 como default quando VITE_API_URL não está definido', async () => {
    vi.unstubAllEnvs()
    fetch.mockResolvedValue(okResponse({ location: {}, forecast: {} }))
    await fetchWeather({ city: 'Lisboa' })
    const [url] = fetch.mock.calls[0]
    expect(url).toBe('http://localhost:3000/api/weather?city=Lisboa')
  })

  it('monta a URL com lat e lon para o fluxo de geolocalização', async () => {
    fetch.mockResolvedValue(okResponse({ location: {}, forecast: {} }))
    await fetchWeather({ lat: -23.5475, lon: -46.6361 })
    const [url] = fetch.mock.calls[0]
    expect(url).toBe(`${BASE_URL}/api/weather?lat=-23.5475&lon=-46.6361`)
  })

  it('usa cache: no-store em toda chamada', async () => {
    fetch.mockResolvedValue(okResponse({ location: {}, forecast: {} }))
    await fetchWeather({ city: 'São Paulo' })
    await fetchWeather({ lat: -23.5475, lon: -46.6361 })
    for (const call of fetch.mock.calls) {
      expect(call[1].cache).toBe('no-store')
    }
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('retorna o JSON da resposta 200', async () => {
    const payload = { location: { name: 'São Paulo' }, forecast: { current: {} } }
    fetch.mockResolvedValue(okResponse(payload))
    await expect(fetchWeather({ city: 'São Paulo' })).resolves.toEqual(payload)
  })

  it.each([
    [400, 'VALIDATION'],
    [404, 'CITY_NOT_FOUND'],
    [500, 'INTERNAL'],
  ])('status %i → WeatherApiError com código "%s" do corpo da resposta', async (status, code) => {
    fetch.mockResolvedValue(errorResponse(status, { error: code, message: 'mensagem do servidor' }))
    const error = await fetchWeather({ city: 'xyz' }).catch((err) => err)
    expect(error).toBeInstanceOf(WeatherApiError)
    expect(error).toBeInstanceOf(Error)
    expect(error.status).toBe(status)
    expect(error.code).toBe(code)
    expect(error.message).toBe('mensagem do servidor')
  })

  it('status não-2xx sem corpo JSON → WeatherApiError com código UNKNOWN', async () => {
    fetch.mockResolvedValue(errorResponse(500))
    const error = await fetchWeather({ city: 'xyz' }).catch((err) => err)
    expect(error).toBeInstanceOf(WeatherApiError)
    expect(error.status).toBe(500)
    expect(error.code).toBe('UNKNOWN')
    expect(error.message).toBeTruthy()
  })

  it('falha de rede → WeatherApiError com código NETWORK e status nulo', async () => {
    fetch.mockRejectedValue(new TypeError('fetch failed'))
    const error = await fetchWeather({ city: 'xyz' }).catch((err) => err)
    expect(error).toBeInstanceOf(WeatherApiError)
    expect(error.status).toBeNull()
    expect(error.code).toBe('NETWORK')
    expect(error.message).toBeTruthy()
  })
})
