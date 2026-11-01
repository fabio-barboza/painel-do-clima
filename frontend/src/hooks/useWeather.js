import { useCallback, useEffect, useRef, useState } from 'react'
import {
  fetchWeather,
  fetchWeatherAtCoords,
  WeatherError,
} from '../services/weather.js'

const GEO_TIMEOUT_MS = 8000
const GEO_MESSAGES = {
  1: 'Localização negada.',
  2: 'Localização não disponível.',
  3: 'Tempo da localização esgotado.',
}

const ERROR_MESSAGES = {
  'not-found': 'Cidade não encontrada.',
  'bad-request': 'Informe um nome de cidade.',
  network: 'Não foi possível carregar o clima.',
}

function geoMessageFor(code) {
  return GEO_MESSAGES[code] ?? GEO_MESSAGES[3]
}

function useWeather() {
  const [status, setStatus] = useState('idle')
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const controllerRef = useRef(null)
  const lastRef = useRef(null)
  const stateRef = useRef({ status: 'idle', data: null })

  const abortActive = useCallback(() => {
    controllerRef.current?.abort()
    controllerRef.current = null
  }, [])

  // Atualiza estado e stateRef juntos: nunca deixam de estar sincronizados.
  const commit = useCallback((next) => {
    stateRef.current = next
    setStatus(next.status)
    setData(next.data)
    if (next.error) {
      setError(next.error)
    }
  }, [])

  const runFetch = useCallback((execute) => {
    abortActive()
    const controller = new AbortController()
    controllerRef.current = controller
    lastRef.current = { execute }
    setStatus('loading')
    setData(null)
    setError(null)

    execute(controller.signal)
      .then((result) => {
        commit({ status: 'success', data: result })
      })
      .catch((err) => {
        if (err?.name === 'AbortError') {
          return
        }
        const kind = err instanceof WeatherError ? err.kind : 'network'
        commit({ status: 'error', data: null, error: { kind, message: ERROR_MESSAGES[kind] } })
      })
  }, [abortActive, commit])

  const search = useCallback((city) => {
    const value = (city ?? '').trim()
    if (!value) {
      commit({ status: 'error', data: null, error: { kind: 'bad-request', message: ERROR_MESSAGES['bad-request'] } })
      return
    }
    runFetch((signal) => fetchWeather(value, { signal }))
  }, [runFetch, commit])

  const locate = useCallback(() => {
    const before = stateRef.current

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError({ kind: 'geo', message: geoMessageFor(2) })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        runFetch((signal) => fetchWeatherAtCoords(latitude, longitude, { signal }))
      },
      (geoError) => {
        commit({
          status: before.status,
          data: before.data,
          error: { kind: 'geo', message: geoMessageFor(geoError.code) },
        })
      },
      { timeout: GEO_TIMEOUT_MS }
    )
  }, [runFetch, commit])

  const retry = useCallback(() => {
    const last = lastRef.current
    if (!last) {
      return
    }
    runFetch(last.execute)
  }, [runFetch])

  useEffect(() => {
    return abortActive
  }, [abortActive])

  return { status, data, error, search, locate, retry }
}

export default useWeather
