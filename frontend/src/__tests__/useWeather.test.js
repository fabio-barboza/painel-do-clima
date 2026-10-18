import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useWeather } from '../hooks/useWeather.js'

const BASE_URL = 'http://api.test.local'

const payloadA = {
  location: { name: 'Curitiba', latitude: -25.43, longitude: -49.27 },
  forecast: { current: { temperature_2m: 15.1, weather_code: 2 } },
}

const payloadB = {
  location: { name: 'São Paulo', latitude: -23.55, longitude: -46.64 },
  forecast: { current: { temperature_2m: 18.3, weather_code: 1 } },
}

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
    json: () => Promise.resolve(body),
  }
}

function deferredPromise() {
  let settle
  const promise = new Promise((resolve) => {
    settle = resolve
  })
  return { promise, settle }
}

function mockGeolocation() {
  const getCurrentPosition = vi.fn()
  Object.defineProperty(navigator, 'geolocation', {
    value: { getCurrentPosition },
    configurable: true,
  })
  return getCurrentPosition
}

const GEOLOCATION_ERROR_MESSAGE =
  'Não foi possível acessar sua localização. Você pode pesquisar a cidade pelo nome no campo acima.'

describe('useWeather', () => {
  let savedGeolocation

  beforeEach(() => {
    savedGeolocation = navigator.geolocation
    vi.stubEnv('VITE_API_URL', BASE_URL)
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    Object.defineProperty(navigator, 'geolocation', {
      value: savedGeolocation,
      configurable: true,
    })
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('começa em idle sem dados nem erro e expõe search', () => {
    const { result } = renderHook(() => useWeather())
    expect(result.current.status).toBe('idle')
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
    expect(typeof result.current.search).toBe('function')
    expect(typeof result.current.locate).toBe('function')
  })

  it('segue o fluxo idle → loading → success com data preenchida', async () => {
    fetch.mockResolvedValue(okResponse(payloadB))
    const { result } = renderHook(() => useWeather())
    act(() => {
      result.current.search('São Paulo')
    })
    expect(result.current.status).toBe('loading')
    expect(result.current.error).toBeNull()
    await act(async () => {})
    expect(result.current.status).toBe('success')
    expect(result.current.data).toEqual(payloadB)
    expect(result.current.error).toBeNull()
  })

  it('envia a cidade pesquisada para o endpoint do backend', async () => {
    fetch.mockResolvedValue(okResponse(payloadB))
    const { result } = renderHook(() => useWeather())
    act(() => {
      result.current.search('São Paulo')
    })
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch.mock.calls[0][0]).toBe(`${BASE_URL}/api/weather?city=S%C3%A3o%20Paulo`)
    await act(async () => {})
    expect(result.current.status).toBe('success')
  })

  it('404 da API → error.city_not_found com mensagem amigável', async () => {
    fetch.mockResolvedValue(
      errorResponse(404, { error: 'CITY_NOT_FOUND', message: "Cidade 'xyz' não encontrada." }),
    )
    const { result } = renderHook(() => useWeather())
    act(() => {
      result.current.search('xyz')
    })
    expect(result.current.status).toBe('loading')
    await act(async () => {})
    expect(result.current.status).toBe('error')
    expect(result.current.data).toBeNull()
    expect(result.current.error).toEqual({
      type: 'city_not_found',
      message: "Cidade 'xyz' não encontrada.",
    })
  })

  it('400 da API → error.invalid', async () => {
    fetch.mockResolvedValue(
      errorResponse(400, { error: 'VALIDATION', message: "Informe 'city' ou 'lat' e 'lon'." }),
    )
    const { result } = renderHook(() => useWeather())
    act(() => {
      result.current.search('')
    })
    await act(async () => {})
    expect(result.current.status).toBe('error')
    expect(result.current.error).toEqual({
      type: 'invalid',
      message: "Informe 'city' ou 'lat' e 'lon'.",
    })
  })

  it('500 da API → error.network', async () => {
    fetch.mockResolvedValue(
      errorResponse(500, { error: 'INTERNAL', message: 'Falha ao consultar o serviço de previsão.' }),
    )
    const { result } = renderHook(() => useWeather())
    act(() => {
      result.current.search('São Paulo')
    })
    await act(async () => {})
    expect(result.current.status).toBe('error')
    expect(result.current.error).toEqual({
      type: 'network',
      message: 'Falha ao consultar o serviço de previsão.',
    })
  })

  it('falha de rede → error.network com mensagem amigável', async () => {
    fetch.mockRejectedValue(new TypeError('fetch failed'))
    const { result } = renderHook(() => useWeather())
    act(() => {
      result.current.search('São Paulo')
    })
    await act(async () => {})
    expect(result.current.status).toBe('error')
    expect(result.current.data).toBeNull()
    expect(result.current.error.type).toBe('network')
    expect(result.current.error.message).toBe('Falha de comunicação com o servidor. Tente novamente.')
  })

  it('descarta resposta obsoleta: apenas a busca mais recente renderiza', async () => {
    const first = deferredPromise()
    fetch
      .mockImplementationOnce(() => first.promise.then(() => okResponse(payloadA)))
      .mockResolvedValueOnce(okResponse(payloadB))
    const { result } = renderHook(() => useWeather())
    act(() => {
      result.current.search('Curitiba')
    })
    expect(result.current.status).toBe('loading')
    act(() => {
      result.current.search('São Paulo')
    })
    expect(result.current.status).toBe('loading')
    await act(async () => {})
    expect(result.current.status).toBe('success')
    expect(result.current.data).toEqual(payloadB)
    first.settle()
    await act(async () => {})
    expect(result.current.status).toBe('success')
    expect(result.current.data).toEqual(payloadB)
    expect(result.current.error).toBeNull()
  })

  it('descarta erro obsoleto: falha da busca anterior não substitui o sucesso da mais recente', async () => {
    const first = deferredPromise()
    fetch
      .mockImplementationOnce(() =>
        first.promise.then(() =>
          errorResponse(404, { error: 'CITY_NOT_FOUND', message: "Cidade 'Curitiba' não encontrada." }),
        ),
      )
      .mockResolvedValueOnce(okResponse(payloadB))
    const { result } = renderHook(() => useWeather())
    act(() => {
      result.current.search('Curitiba')
    })
    act(() => {
      result.current.search('São Paulo')
    })
    await act(async () => {})
    expect(result.current.status).toBe('success')
    expect(result.current.data).toEqual(payloadB)
    first.settle()
    await act(async () => {})
    expect(result.current.status).toBe('success')
    expect(result.current.data).toEqual(payloadB)
    expect(result.current.error).toBeNull()
  })

  describe('locate', () => {
    it('geolocalização permitida → busca por coordenadas e success', async () => {
      fetch.mockResolvedValue(okResponse(payloadB))
      const getCurrentPosition = mockGeolocation()
      getCurrentPosition.mockImplementation((onSuccess) => {
        onSuccess({ coords: { latitude: -23.55, longitude: -46.64 } })
      })
      const { result } = renderHook(() => useWeather())
      act(() => {
        result.current.locate()
      })
      expect(getCurrentPosition).toHaveBeenCalledTimes(1)
      expect(fetch).toHaveBeenCalledTimes(1)
      expect(fetch.mock.calls[0][0]).toBe(`${BASE_URL}/api/weather?lat=-23.55&lon=-46.64`)
      await act(async () => {})
      expect(result.current.status).toBe('success')
      expect(result.current.data).toEqual(payloadB)
      expect(result.current.error).toBeNull()
    })

    it('exibe loading durante a geolocalização', async () => {
      fetch.mockResolvedValue(okResponse(payloadB))
      const getCurrentPosition = mockGeolocation()
      getCurrentPosition.mockImplementation(() => {})
      const { result } = renderHook(() => useWeather())
      act(() => {
        result.current.locate()
      })
      expect(result.current.status).toBe('loading')
      expect(result.current.error).toBeNull()
      expect(result.current.data).toBeNull()
    })

    it('geolocalização negada → error geolocation com mensagem amigável e sem fetch', async () => {
      const getCurrentPosition = mockGeolocation()
      getCurrentPosition.mockImplementation((_onSuccess, onError) => {
        onError({ code: 1, message: 'Permission denied' })
      })
      const { result } = renderHook(() => useWeather())
      act(() => {
        result.current.locate()
      })
      await act(async () => {})
      expect(result.current.status).toBe('error')
      expect(result.current.data).toBeNull()
      expect(fetch).not.toHaveBeenCalled()
      expect(result.current.error).toEqual({
        type: 'geolocation',
        message: GEOLOCATION_ERROR_MESSAGE,
      })
    })

    it('geolocalização indisponível no browser → error geolocation com mensagem amigável', async () => {
      Object.defineProperty(navigator, 'geolocation', { value: undefined, configurable: true })
      const { result } = renderHook(() => useWeather())
      act(() => {
        result.current.locate()
      })
      expect(result.current.status).toBe('error')
      expect(result.current.data).toBeNull()
      expect(fetch).not.toHaveBeenCalled()
      expect(result.current.error).toEqual({
        type: 'geolocation',
        message: GEOLOCATION_ERROR_MESSAGE,
      })
    })

    it('falha do fetch após geolocalização permitida → erro tipado de rede', async () => {
      fetch.mockResolvedValue(
        errorResponse(404, { error: 'CITY_NOT_FOUND', message: "Cidade 'xyz' não encontrada." }),
      )
      const getCurrentPosition = mockGeolocation()
      getCurrentPosition.mockImplementation((onSuccess) => {
        onSuccess({ coords: { latitude: -23.55, longitude: -46.64 } })
      })
      const { result } = renderHook(() => useWeather())
      act(() => {
        result.current.locate()
      })
      await act(async () => {})
      expect(result.current.status).toBe('error')
      expect(result.current.error.type).toBe('city_not_found')
    })

    it('descarta geolocalização obsoleta: busca manual posterior prevalece (D12)', async () => {
      fetch
        .mockResolvedValueOnce(okResponse(payloadB))
        .mockResolvedValueOnce(okResponse(payloadA))
      const getCurrentPosition = mockGeolocation()
      let pendingOnSuccess
      getCurrentPosition.mockImplementation((onSuccess) => {
        pendingOnSuccess = onSuccess
      })
      const { result } = renderHook(() => useWeather())
      act(() => {
        result.current.locate()
      })
      act(() => {
        result.current.search('São Paulo')
      })
      await act(async () => {})
      expect(result.current.status).toBe('success')
      expect(result.current.data).toEqual(payloadB)
      act(() => {
        pendingOnSuccess({ coords: { latitude: -25.43, longitude: -49.27 } })
      })
      await act(async () => {})
      expect(result.current.status).toBe('success')
      expect(result.current.data).toEqual(payloadB)
      expect(result.current.error).toBeNull()
    })
  })
})
