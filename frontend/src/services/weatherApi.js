export class WeatherApiError extends Error {
  constructor(status, code, message) {
    super(message)
    this.name = 'WeatherApiError'
    this.status = status
    this.code = code
  }
}

const DEFAULT_API_URL = 'http://localhost:3000'

function buildUrl(query) {
  const baseUrl = import.meta.env.VITE_API_URL || DEFAULT_API_URL
  const params = []
  if (query.city) {
    params.push(`city=${encodeURIComponent(query.city)}`)
  }
  if (query.lat != null) {
    params.push(`lat=${encodeURIComponent(query.lat)}`)
  }
  if (query.lon != null) {
    params.push(`lon=${encodeURIComponent(query.lon)}`)
  }
  const qs = params.join('&')
  return `${baseUrl}/api/weather${qs ? `?${qs}` : ''}`
}

export async function fetchWeather(query = {}) {
  let response
  try {
    response = await fetch(buildUrl(query), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
  } catch {
    throw new WeatherApiError(null, 'NETWORK', 'Falha de comunicação com o servidor. Tente novamente.')
  }
  if (response.ok) {
    return response.json()
  }
  const body = await response.json().catch(() => null)
  const code = body?.error ?? 'UNKNOWN'
  const message = body?.message ?? `Erro inesperado (status ${response.status}).`
  throw new WeatherApiError(response.status, code, message)
}
