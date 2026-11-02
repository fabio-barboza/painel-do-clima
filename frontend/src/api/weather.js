const DEFAULT_API_BASE_URL = 'http://localhost:3000'
const WEATHER_PATH = '/api/weather'
const TRAILING_SLASH = /\/$/
const BAD_REQUEST_STATUS = 400
const NOT_FOUND_STATUS = 404

export const WEATHER_ERROR_KINDS = Object.freeze({
  INVALID: 'invalid',
  NOT_FOUND: 'not_found',
  NETWORK: 'network',
})

export class WeatherApiError extends Error {
  constructor(kind) {
    super(`Falha na consulta do clima: ${kind}`)
    this.name = 'WeatherApiError'
    this.kind = kind
  }
}

function resolveApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL
  return configuredUrl.replace(TRAILING_SLASH, '')
}

function buildSearchParams(query) {
  if (query.city !== undefined) {
    return new URLSearchParams({ city: query.city })
  }
  return new URLSearchParams({ lat: String(query.lat), lon: String(query.lon) })
}

function kindForStatus(status) {
  if (status === BAD_REQUEST_STATUS) return WEATHER_ERROR_KINDS.INVALID
  if (status === NOT_FOUND_STATUS) return WEATHER_ERROR_KINDS.NOT_FOUND
  return WEATHER_ERROR_KINDS.NETWORK
}

async function requestWeather(url, signal) {
  try {
    return await fetch(url, { cache: 'no-store', signal })
  } catch {
    throw new WeatherApiError(WEATHER_ERROR_KINDS.NETWORK)
  }
}

async function readWeatherJson(response) {
  try {
    return await response.json()
  } catch {
    throw new WeatherApiError(WEATHER_ERROR_KINDS.NETWORK)
  }
}

export async function fetchWeather(query, { signal } = {}) {
  const url = `${resolveApiBaseUrl()}${WEATHER_PATH}?${buildSearchParams(query)}`
  const response = await requestWeather(url, signal)
  if (!response.ok) {
    throw new WeatherApiError(kindForStatus(response.status))
  }
  return readWeatherJson(response)
}
