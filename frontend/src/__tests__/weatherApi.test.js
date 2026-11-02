import { fetchWeather, WeatherApiError, WEATHER_ERROR_KINDS } from '../api/weather.js'
import { WEATHER_FIXTURE } from './fixtures/weather.js'

const DEFAULT_URL = 'http://localhost:3000/api/weather?city=Curitiba'
const COORDINATES_URL = 'http://localhost:3000/api/weather?lat=-25.43&lon=-49.27'
const JSON_HEADERS = { 'Content-Type': 'application/json' }

function stubFetchResponse(status, body) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), { status, headers: JSON_HEADERS }),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

async function captureError(promise) {
  try {
    await promise
  } catch (error) {
    return error
  }
  return null
}

describe('fetchWeather', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  test('chama GET /api/weather com a cidade codificada e cache no-store', async () => {
    const fetchMock = stubFetchResponse(200, WEATHER_FIXTURE)

    await fetchWeather({ city: 'Curitiba' })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(DEFAULT_URL, expect.objectContaining({ cache: 'no-store' }))
  })

  test('codifica nomes com espaços e acentos na query string', async () => {
    const fetchMock = stubFetchResponse(200, WEATHER_FIXTURE)

    await fetchWeather({ city: 'São Paulo' })

    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:3000/api/weather?city=S%C3%A3o+Paulo')
  })

  test('envia lat e lon para consulta por coordenadas', async () => {
    const fetchMock = stubFetchResponse(200, WEATHER_FIXTURE)

    await fetchWeather({ lat: -25.43, lon: -49.27 })

    expect(fetchMock).toHaveBeenCalledWith(COORDINATES_URL, expect.objectContaining({ cache: 'no-store' }))
  })

  test('repassa o sinal de cancelamento ao fetch', async () => {
    const fetchMock = stubFetchResponse(200, WEATHER_FIXTURE)
    const controller = new AbortController()

    await fetchWeather({ city: 'Curitiba' }, { signal: controller.signal })

    expect(fetchMock).toHaveBeenCalledWith(
      DEFAULT_URL,
      expect.objectContaining({ cache: 'no-store', signal: controller.signal }),
    )
  })

  test('retorna o corpo JSON da resposta de sucesso', async () => {
    stubFetchResponse(200, WEATHER_FIXTURE)

    await expect(fetchWeather({ city: 'Curitiba' })).resolves.toEqual(WEATHER_FIXTURE)
  })

  test('usa VITE_API_URL como base quando definido', async () => {
    vi.stubEnv('VITE_API_URL', 'https://api.exemplo.test/')
    const fetchMock = stubFetchResponse(200, WEATHER_FIXTURE)

    await fetchWeather({ city: 'Curitiba' })

    expect(fetchMock.mock.calls[0][0]).toBe('https://api.exemplo.test/api/weather?city=Curitiba')
  })

  test.each([
    [400, WEATHER_ERROR_KINDS.INVALID],
    [404, WEATHER_ERROR_KINDS.NOT_FOUND],
    [502, WEATHER_ERROR_KINDS.NETWORK],
    [500, WEATHER_ERROR_KINDS.NETWORK],
  ])('mapeia status %i para o tipo %s', async (status, expectedKind) => {
    stubFetchResponse(status, { error: { code: 'X', message: 'x' } })

    const error = await captureError(fetchWeather({ city: 'Curitiba' }))

    expect(error).toBeInstanceOf(WeatherApiError)
    expect(error.kind).toBe(expectedKind)
  })

  test('mapeia falha de rede para o tipo network', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    const error = await captureError(fetchWeather({ city: 'Curitiba' }))

    expect(error).toBeInstanceOf(WeatherApiError)
    expect(error.kind).toBe(WEATHER_ERROR_KINDS.NETWORK)
  })

  test('mapeia cancelamento (tempo esgotado) para o tipo network', async () => {
    const controller = new AbortController()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError')))
    controller.abort()

    const error = await captureError(fetchWeather({ city: 'Curitiba' }, { signal: controller.signal }))

    expect(error.kind).toBe(WEATHER_ERROR_KINDS.NETWORK)
  })

  test('mapeia JSON inválido em sucesso para o tipo network', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>', { status: 200 })))

    const error = await captureError(fetchWeather({ city: 'Curitiba' }))

    expect(error.kind).toBe(WEATHER_ERROR_KINDS.NETWORK)
  })
})
