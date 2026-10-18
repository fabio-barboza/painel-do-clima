const { getEnv } = require('../config/env');

class CityNotFoundError extends Error {
  constructor(city) {
    super(`Cidade '${city}' não encontrada.`);
    this.name = 'CityNotFoundError';
  }
}

function extractLocation(result) {
  return {
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    country: result.country,
    admin1: result.admin1,
    timezone: result.timezone
  };
}

function baseLogLevel() {
  return getEnv().nodeEnv === 'production' ? 'info' : 'debug';
}

function logExternalCall({ level, target, status, durationMs, error }) {
  const entry = {
    level,
    event: 'external_call',
    target,
    status,
    durationMs
  };
  if (error) {
    entry.error = error;
  }
  console.log(JSON.stringify(entry));
}

function fetchWithTimeout(url) {
  const { externalTimeoutMs } = getEnv();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), externalTimeoutMs);
  return fetch(url, {
    method: 'GET',
    signal: controller.signal
  })
    .then(
      (response) => {
        clearTimeout(timer);
        return response;
      },
      (error) => {
        clearTimeout(timer);
        if (error && error.name === 'AbortError') {
          throw new Error(`Timeout (${externalTimeoutMs}ms) na chamada externa para ${url}`);
        }
        throw error;
      }
    );
}

async function geocodeCity(name) {
  const { geocodingBaseUrl } = getEnv();
  const target = `${geocodingBaseUrl}/v1/search?name=${encodeURIComponent(name)}&count=1&language=pt`;
  const startedAt = Date.now();
  let response;
  try {
    response = await fetchWithTimeout(target);
  } catch (error) {
    logExternalCall({
      level: 'error',
      target,
      status: null,
      durationMs: Date.now() - startedAt,
      error: error.message
    });
    throw error;
  }
  const durationMs = Date.now() - startedAt;
  if (!response.ok) {
    logExternalCall({
      level: 'warn',
      target,
      status: response.status,
      durationMs
    });
    throw new Error(`Open-Meteo geocoding respondeu com status ${response.status}`);
  }
  logExternalCall({
    level: baseLogLevel(),
    target,
    status: response.status,
    durationMs
  });
  const data = await response.json();
  const firstResult = data.results ? data.results[0] : undefined;
  if (!firstResult) {
    throw new CityNotFoundError(name);
  }
  return extractLocation(firstResult);
}

async function getForecast(latitude, longitude) {
  const { forecastBaseUrl } = getEnv();
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m',
    hourly: 'temperature_2m,precipitation,uv_index',
    daily: 'weather_code,temperature_2m_min,temperature_2m_max,precipitation_sum',
    timezone: 'auto',
    forecast_hours: '24',
    forecast_days: '7',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm'
  });
  const target = `${forecastBaseUrl}/v1/forecast?${params.toString()}`;
  const startedAt = Date.now();
  let response;
  try {
    response = await fetchWithTimeout(target);
  } catch (error) {
    logExternalCall({
      level: 'error',
      target,
      status: null,
      durationMs: Date.now() - startedAt,
      error: error.message
    });
    throw error;
  }
  const durationMs = Date.now() - startedAt;
  if (!response.ok) {
    logExternalCall({
      level: 'warn',
      target,
      status: response.status,
      durationMs
    });
    throw new Error(`Open-Meteo forecast respondeu com status ${response.status}`);
  }
  logExternalCall({
    level: baseLogLevel(),
    target,
    status: response.status,
    durationMs
  });
  return response.json();
}

module.exports = {
  geocodeCity,
  getForecast,
  CityNotFoundError
};
