import { useCallback, useRef, useState } from 'react'
import { WeatherApiError, fetchWeather } from '../services/weatherApi.js'

const NETWORK_ERROR_MESSAGE = 'Falha de comunicação com o servidor. Tente novamente.'
const GEOLOCATION_ERROR_MESSAGE =
  'Não foi possível acessar sua localização. Você pode pesquisar a cidade pelo nome no campo acima.'
const GEOLOCATION_TIMEOUT_MS = 10000

function toTypedError(error) {
  if (error instanceof WeatherApiError) {
    if (error.status === 404 || error.code === 'CITY_NOT_FOUND') {
      return { type: 'city_not_found', message: error.message }
    }
    if (error.status === 400 || error.code === 'VALIDATION') {
      return { type: 'invalid', message: error.message }
    }
  }
  const message = error instanceof Error ? error.message : ''
  return { type: 'network', message: message || NETWORK_ERROR_MESSAGE }
}

export function useWeather() {
  const [status, setStatus] = useState('idle')
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const requestIdRef = useRef(0)

  const search = useCallback((city) => {
    const requestId = ++requestIdRef.current
    setStatus('loading')
    setError(null)
    fetchWeather({ city }).then(
      (result) => {
        if (requestId !== requestIdRef.current) {
          return
        }
        setData(result)
        setStatus('success')
      },
      (failure) => {
        if (requestId !== requestIdRef.current) {
          return
        }
        setError(toTypedError(failure))
        setStatus('error')
      },
    )
  }, [])

  const locate = useCallback(() => {
    const requestId = ++requestIdRef.current
    setStatus('loading')
    setError(null)
    if (!navigator.geolocation) {
      setError({ type: 'geolocation', message: GEOLOCATION_ERROR_MESSAGE })
      setStatus('error')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        fetchWeather({ lat: latitude, lon: longitude }).then(
          (result) => {
            if (requestId !== requestIdRef.current) {
              return
            }
            setData(result)
            setStatus('success')
          },
          (failure) => {
            if (requestId !== requestIdRef.current) {
              return
            }
            setError(toTypedError(failure))
            setStatus('error')
          },
        )
      },
      () => {
        if (requestId !== requestIdRef.current) {
          return
        }
        setError({ type: 'geolocation', message: GEOLOCATION_ERROR_MESSAGE })
        setStatus('error')
      },
      { timeout: GEOLOCATION_TIMEOUT_MS },
    )
  }, [])

  return { status, data, error, search, locate }
}
