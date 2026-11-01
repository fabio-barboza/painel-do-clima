export class WeatherError extends Error {
  constructor(kind, status) {
    super(kind)
    this.name = 'WeatherError'
    this.kind = kind
    this.status = status
  }
}

const BASE_URL = import.meta.env.VITE_API_URL ?? ''
const TIMEOUT_MS = 8000

function buildUrl(path, params) {
  const query = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')
  return BASE_URL + path + (query ? `?${query}` : '')
}

function resolveSignal(external) {
  if (!external) {
    return AbortSignal.timeout(TIMEOUT_MS)
  }
  try {
    return AbortSignal.any([external, AbortSignal.timeout(TIMEOUT_MS)])
  } catch {
    return external
  }
}

async function request(url, signal) {
  let response
  try {
    response = await fetch(url, { cache: 'no-store', signal })
  } catch (err) {
    if (signal && signal.aborted) {
      throw err
    }
    throw new WeatherError('network', undefined)
  }
  if (response.ok) {
    return response.json()
  }
  const kind = response.status === 404
    ? 'not-found'
    : response.status === 400
      ? 'bad-request'
      : 'network'
  throw new WeatherError(kind, response.status)
}

export function fetchWeather(city, options) {
  const url = buildUrl('/api/weather', { city })
  return request(url, resolveSignal(options?.signal))
}

export function fetchWeatherAtCoords(latitude, longitude, options) {
  const url = buildUrl('/api/weather', { latitude, longitude })
  return request(url, resolveSignal(options?.signal))
}
