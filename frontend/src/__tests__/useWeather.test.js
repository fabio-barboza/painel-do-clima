import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { act } from 'react'
import { renderHook } from '@testing-library/react'
import useWeather from '../hooks/useWeather.js'

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }
}

function makeEnvelope(hourly = 24) {
  const seq = (n) => Array.from({ length: n }, (_, i) => i)
  return {
    city: { name: 'Curitiba', region: 'Paraná', display: 'Curitiba, Paraná', latitude: -25.43, longitude: -49.27 },
    timezone: 'America/Sao_Paulo',
    current: { temperature_2m: 20, weather_code: 0 },
    hourly: { time: seq(hourly), temperature_2m: seq(hourly), precipitation: seq(hourly), weather_code: seq(hourly) },
    daily: {
      time: seq(7),
      temperature_2m_max: seq(7),
      temperature_2m_min: seq(7),
      precipitation_probability_max: seq(7),
      precipitation_sum: seq(7),
      weather_code: seq(7),
    },
  }
}

const flush = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
}

function geoMock(behavior) {
  return { getCurrentPosition: vi.fn(behavior) }
}

function setGeo(behavior) {
  vi.stubGlobal('navigator', { ...globalThis.navigator, geolocation: geoMock(behavior) })
}

describe('useWeather', () => {
  let fetchSpy
  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(200, makeEnvelope()))
  })
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  test('busca por cidade: idle → loading → success com data completa', async () => {
    const { result } = renderHook(() => useWeather())
    expect(result.current.status).toBe('idle')

    act(() => { result.current.search('Curitiba') })
    expect(result.current.status).toBe('loading')

    await flush()
    expect(result.current.status).toBe('success')
    expect(result.current.data.city.display).toBe('Curitiba, Paraná')
    expect(result.current.data.hourly.time).toHaveLength(24)
  })

  test('404 → error kind "not-found"', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse(404, { error: 'não' }))
    const { result } = renderHook(() => useWeather())
    act(() => { result.current.search('Xanadu') })
    await flush()
    expect(result.current.status).toBe('error')
    expect(result.current.error.kind).toBe('not-found')
  })

  test('400 → error kind "bad-request"', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse(400, { error: 'ruim' }))
    const { result } = renderHook(() => useWeather())
    act(() => { result.current.search('Curitiba') })
    await flush()
    expect(result.current.error.kind).toBe('bad-request')
  })

  test('500 → error kind "network"', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse(500, { error: 'servidor' }))
    const { result } = renderHook(() => useWeather())
    act(() => { result.current.search('Curitiba') })
    await flush()
    expect(result.current.error.kind).toBe('network')
  })

  test('falha de rede → error kind "network"', async () => {
    fetchSpy.mockRejectedValueOnce(new TypeError('Network failed'))
    const { result } = renderHook(() => useWeather())
    act(() => { result.current.search('Curitiba') })
    await flush()
    expect(result.current.error.kind).toBe('network')
  })

  test('busca vazia (após trim) → bad-request sem disparar fetch', () => {
    const { result } = renderHook(() => useWeather())
    act(() => { result.current.search('    ') })
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(result.current.status).toBe('error')
    expect(result.current.error.kind).toBe('bad-request')
  })

  test('retry reexecuta a última consulta por cidade', async () => {
    const { result } = renderHook(() => useWeather())
    act(() => { result.current.search('Curitiba') })
    await flush()
    expect(fetchSpy).toHaveBeenCalledTimes(1)

    act(() => { result.current.retry() })
    await flush()
    expect(fetchSpy).toHaveBeenCalledTimes(2)
    expect(result.current.status).toBe('success')
    expect(fetchSpy.mock.calls[1][0]).toBe('/api/weather?city=Curitiba')
  })

  test('nova busca aborta a anterior (AbortController)', async () => {
    let firstResolve
    fetchSpy.mockImplementation(() => new Promise((resolve) => { firstResolve = resolve }))
    const { result } = renderHook(() => useWeather())

    act(() => { result.current.search('Curitiba') })
    const firstSignal = fetchSpy.mock.calls[0][1].signal

    act(() => { result.current.search('São Paulo') })
    const secondSignal = fetchSpy.mock.calls[1][1].signal

    expect(firstSignal.aborted).toBe(true)
    expect(secondSignal.aborted).toBe(false)

    await act(async () => { firstResolve(jsonResponse(200, makeEnvelope())) })
  })

  test('nova busca aborta a anterior sem mostrar erro de rede falso', async () => {
    const inflight = []
    fetchSpy.mockImplementation((_url, options) => {
      return new Promise((resolve, reject) => {
        inflight.push({ resolve, reject })
        const signal = options?.signal
        if (signal) {
          signal.addEventListener('abort', () => {
            const abort = new Error('The operation was aborted')
            abort.name = 'AbortError'
            reject(abort)
          })
        }
      })
    })
    const { result } = renderHook(() => useWeather())

    act(() => { result.current.search('Curitiba') })
    act(() => { result.current.search('São Paulo') })

    // A primeira busca foi abortada: a rejeição (AbortError) deve ser descartada
    // e não converter em erro de rede enquanto a segunda busca está em voo.
    await flush()
    expect(result.current.error).toBeNull()
    expect(result.current.status).toBe('loading')

    // A segunda busca resolve → success, sem erro falso intermediário.
    await act(async () => {
      inflight[1].resolve(jsonResponse(200, makeEnvelope()))
    })
    expect(result.current.status).toBe('success')
    expect(result.current.error).toBeNull()
  })

  test('desmonta aborta a requisição em voo', async () => {
    fetchSpy.mockImplementation(() => new Promise(() => {}))
    const { result, unmount } = renderHook(() => useWeather())
    act(() => { result.current.search('Curitiba') })
    const signal = fetchSpy.mock.calls[0][1].signal
    expect(signal.aborted).toBe(false)
    unmount()
    expect(signal.aborted).toBe(true)
  })

  test('geolocalização com sucesso → success por coordenadas', async () => {
    setGeo((success) => success({ coords: { latitude: -25.43, longitude: -49.27 } }))
    const { result } = renderHook(() => useWeather())
    act(() => { result.current.locate() })
    await flush()
    expect(result.current.status).toBe('success')
    expect(fetchSpy.mock.calls[0][0]).toContain('latitude=-25.43')
  })

  test('retry reexecuta a última consulta geográfica', async () => {
    setGeo((success) => success({ coords: { latitude: -25.43, longitude: -49.27 } }))
    const { result } = renderHook(() => useWeather())
    act(() => { result.current.locate() })
    await flush()
    expect(fetchSpy).toHaveBeenCalledTimes(1)

    act(() => { result.current.retry() })
    await flush()
    expect(fetchSpy).toHaveBeenCalledTimes(2)
    expect(result.current.status).toBe('success')
  })

  test('geolocalização negada → error kind "geo" preservando estado anterior', async () => {
    setGeo((_success, error) => error({ code: 1 }))
    const { result } = renderHook(() => useWeather())

    act(() => { result.current.search('Curitiba') })
    await flush()
    expect(result.current.status).toBe('success')
    const antes = result.current.data

    act(() => { result.current.locate() })
    expect(result.current.error.kind).toBe('geo')
    expect(result.current.status).toBe('success')
    expect(result.current.data).toBe(antes)
  })

  test('sucesso → busca vazia → geo negado não restaura o sucesso antigo', async () => {
    setGeo((_success, error) => error({ code: 1 }))
    const { result } = renderHook(() => useWeather())

    // 1) busca com sucesso (dados A); stateRef deve registrar o sucesso
    act(() => { result.current.search('Curitiba') })
    await flush()
    expect(result.current.status).toBe('success')
    const antes = result.current.data

    // 2) busca vazia local → erro bad-request (seções vazias); stateRef deve sincronizar
    act(() => { result.current.search('   ') })
    expect(result.current.status).toBe('error')
    expect(result.current.error.kind).toBe('bad-request')
    expect(result.current.data).toBeNull()

    // 3) geo negado: preserva o estado anterior (vazio), não o sucesso antigo
    act(() => { result.current.locate() })
    expect(result.current.error.kind).toBe('geo')
    expect(result.current.error.message).toBe('Localização negada.')
    expect(result.current.status).toBe('error')
    expect(result.current.data).toBeNull()
    expect(result.current.data).not.toBe(antes)
  })
})
