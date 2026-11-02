import { act, renderHook, waitFor } from '@testing-library/react'
import useWeather from '../hooks/useWeather.js'
import { WEATHER_FIXTURE } from './fixtures/weather.js'

const CURITIBA_URL = 'http://localhost:3000/api/weather?city=Curitiba'
const NOT_FOUND_MESSAGE = 'Não encontramos essa cidade. Confira o nome e tente novamente.'
const NETWORK_MESSAGE = 'Não foi possível obter os dados do clima agora.'
const GEOLOCATION_MESSAGE =
  'Não foi possível obter sua localização. Verifique a permissão do navegador ou pesquise pelo nome da cidade.'
const EMPTY_MESSAGE = 'Digite o nome de uma cidade ou região para pesquisar.'
const SELF_LABEL = 'Sua localização'
const TIMEOUT_MS = 20000

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

function deferredResponse() {
  let resolve
  const promise = new Promise((resolver) => {
    resolve = resolver
  })
  return { promise, resolve }
}

function abortableFetch(url, { signal }) {
  return new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
  })
}

function stubGeolocation(implementation) {
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: { getCurrentPosition: vi.fn(implementation) },
  })
  return navigator.geolocation.getCurrentPosition
}

function removeGeolocation() {
  delete navigator.geolocation
}

describe('useWeather', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    removeGeolocation()
  })

  test('começa ocioso, sem dados e sem chamar o backend', () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    const { result } = renderHook(() => useWeather())

    expect(result.current.status).toBe('idle')
    expect(result.current.busy).toBeNull()
    expect(result.current.data).toBeNull()
    expect(result.current.notice).toBeNull()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  test('busca vazia ou só com espaços não chama o backend e orienta o usuário', () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    const { result } = renderHook(() => useWeather())

    act(() => result.current.search('   '))

    expect(fetchSpy).not.toHaveBeenCalled()
    expect(result.current.notice).toEqual({ kind: 'info', message: EMPTY_MESSAGE, canRetry: false })
  })

  test('busca bem-sucedida envia a consulta, preenche os dados e o rótulo do local', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, WEATHER_FIXTURE))
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => useWeather())

    act(() => result.current.search(' Curitiba '))

    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(fetchMock).toHaveBeenCalledWith(CURITIBA_URL, expect.objectContaining({ cache: 'no-store' }))
    expect(result.current.data).toEqual(WEATHER_FIXTURE)
    expect(result.current.locationLabel).toBe('Curitiba, Paraná')
    expect(result.current.busy).toBeNull()
  })

  test('o rótulo usa só o nome quando a região não existe', async () => {
    const withoutRegion = { ...WEATHER_FIXTURE, location: { name: 'Lisboa', region: null, country: 'Portugal' } }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, withoutRegion)))
    const { result } = renderHook(() => useWeather())

    act(() => result.current.search('Lisboa'))

    await waitFor(() => expect(result.current.locationLabel).toBe('Lisboa'))
  })

  test('a consulta mais recente vence mesmo quando a anterior responde depois', async () => {
    const slowResponse = deferredResponse()
    const fastResponse = { ...WEATHER_FIXTURE, location: { name: 'Recife', region: 'Pernambuco', country: 'Brasil' } }
    const fetchMock = vi
      .fn()
      .mockReturnValueOnce(slowResponse.promise)
      .mockResolvedValueOnce(jsonResponse(200, fastResponse))
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => useWeather())

    act(() => result.current.search('Curitiba'))
    act(() => result.current.search('Recife'))

    await waitFor(() => expect(result.current.locationLabel).toBe('Recife, Pernambuco'))
    await act(async () => {
      slowResponse.resolve(jsonResponse(200, WEATHER_FIXTURE))
    })
    expect(result.current.locationLabel).toBe('Recife, Pernambuco')
    expect(result.current.data).toEqual(fastResponse)
  })

  test('a resposta de geolocalização que chega após uma busca por nome é descartada', async () => {
    const getCurrentPosition = stubGeolocation(() => {})
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, WEATHER_FIXTURE))
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => useWeather())

    act(() => result.current.locate())
    act(() => result.current.search('Curitiba'))
    await waitFor(() => expect(result.current.locationLabel).toBe('Curitiba, Paraná'))

    const successCallback = getCurrentPosition.mock.calls[0][0]
    act(() => successCallback({ coords: { latitude: 1, longitude: 2 } }))

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(result.current.locationLabel).toBe('Curitiba, Paraná')
  })

  test('erro de cidade não encontrada mostra a mensagem sem apagar a última consulta bem-sucedida', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, WEATHER_FIXTURE))
      .mockResolvedValueOnce(jsonResponse(404, { error: { code: 'CITY_NOT_FOUND', message: 'x' } }))
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => useWeather())

    act(() => result.current.search('Curitiba'))
    await waitFor(() => expect(result.current.status).toBe('ready'))
    act(() => result.current.search('Xyzzy'))

    await waitFor(() => expect(result.current.notice?.message).toBe(NOT_FOUND_MESSAGE))
    expect(result.current.status).toBe('ready')
    expect(result.current.data).toEqual(WEATHER_FIXTURE)
    expect(result.current.notice.canRetry).toBe(false)
  })

  test('falha de rede oferece nova tentativa que repete a última consulta', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(jsonResponse(200, WEATHER_FIXTURE))
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => useWeather())

    act(() => result.current.search('Curitiba'))
    await waitFor(() => expect(result.current.notice?.message).toBe(NETWORK_MESSAGE))
    expect(result.current.notice.canRetry).toBe(true)
    expect(result.current.status).toBe('idle')

    act(() => result.current.retry())

    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.notice).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[1][0]).toBe(CURITIBA_URL)
  })

  test('tempo esgotado de 20 s conta como falha de comunicação', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn(abortableFetch))
    const { result } = renderHook(() => useWeather())

    act(() => result.current.search('Curitiba'))
    await act(async () => {
      vi.advanceTimersByTime(TIMEOUT_MS)
    })

    expect(result.current.notice?.message).toBe(NETWORK_MESSAGE)
    expect(result.current.status).toBe('idle')
  })

  test('geolocalização negada mostra a orientação e libera a busca por nome', async () => {
    stubGeolocation((onSuccess, onError) => onError({ code: 1 }))
    vi.stubGlobal('fetch', vi.fn())
    const { result } = renderHook(() => useWeather())

    act(() => result.current.locate())

    await waitFor(() => expect(result.current.notice?.message).toBe(GEOLOCATION_MESSAGE))
    expect(result.current.busy).toBeNull()
    expect(result.current.notice.canRetry).toBe(false)
  })

  test('geolocalização indisponível no navegador mostra a mesma orientação', () => {
    const { result } = renderHook(() => useWeather())

    act(() => result.current.locate())

    expect(result.current.notice?.message).toBe(GEOLOCATION_MESSAGE)
  })

  test('localização concedida consulta as coordenadas em memória e mostra "Sua localização"', async () => {
    const coordinatesUrl = 'http://localhost:3000/api/weather?lat=-25.43&lon=-49.27'
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { ...WEATHER_FIXTURE, location: { name: null } }))
    vi.stubGlobal('fetch', fetchMock)
    stubGeolocation((onSuccess) => onSuccess({ coords: { latitude: -25.43, longitude: -49.27 } }))
    const { result } = renderHook(() => useWeather())

    act(() => result.current.locate())

    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(fetchMock).toHaveBeenCalledWith(coordinatesUrl, expect.objectContaining({ cache: 'no-store' }))
    expect(result.current.locationLabel).toBe(SELF_LABEL)
  })

  test('geolocalização usa as opções de precisão, tempo e cache definidas', () => {
    const getCurrentPosition = stubGeolocation(() => {})
    const { result } = renderHook(() => useWeather())

    act(() => result.current.locate())

    expect(getCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    )
    expect(result.current.busy).toBe('locate')
    expect(result.current.status).toBe('idle')
  })

  test('busca por nome continua disponível enquanto aguarda a permissão de localização', async () => {
    stubGeolocation(() => {})
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, WEATHER_FIXTURE))
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => useWeather())

    act(() => result.current.locate())
    act(() => result.current.search('Curitiba'))

    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.busy).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
