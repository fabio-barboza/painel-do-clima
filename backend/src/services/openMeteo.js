const HttpError = require('../lib/httpError');

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_SERVICE = 'geocoding';
const FORECAST_SERVICE = 'forecast';
const UPSTREAM_TIMEOUT_MS = 8000;
const GEOCODING_RESULT_COUNT = 1;
const GEOCODING_LANGUAGE = 'pt';
const RESPONSE_FORMAT = 'json';
const FORECAST_TIMEZONE = 'auto';
const FORECAST_DAYS = 7;
const CURRENT_VARIABLES = 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,uv_index';
const HOURLY_VARIABLES = 'temperature_2m,precipitation';
const DAILY_VARIABLES = 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max';
const UPSTREAM_STATUS = 502;
const UPSTREAM_CODE = 'UPSTREAM_ERROR';
const UPSTREAM_MESSAGE = 'Não foi possível obter os dados do clima agora.';
const INVALID_PAYLOAD_REASON = 'payload inválido';
const FORECAST_SECTIONS = ['current', 'hourly', 'daily'];

class UpstreamFailure extends Error {
  constructor(reason) {
    super(reason);
    this.name = 'UpstreamFailure';
    this.reason = reason;
  }
}

function buildGeocodingUrl(name) {
  const parameters = new URLSearchParams({
    name,
    count: String(GEOCODING_RESULT_COUNT),
    language: GEOCODING_LANGUAGE,
    format: RESPONSE_FORMAT
  });
  return `${GEOCODING_URL}?${parameters.toString()}`;
}

function buildForecastUrl({ latitude, longitude }) {
  const parameters = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: CURRENT_VARIABLES,
    hourly: HOURLY_VARIABLES,
    daily: DAILY_VARIABLES,
    timezone: FORECAST_TIMEZONE,
    forecast_days: String(FORECAST_DAYS)
  });
  return `${FORECAST_URL}?${parameters.toString()}`;
}

function describeFailure(error) {
  if (error instanceof UpstreamFailure) {
    return error.reason;
  }
  return error.name;
}

function logUpstreamFailure(serviceName, reason, durationMs) {
  console.error(`Falha no serviço externo ${serviceName}: ${reason} (${durationMs} ms)`);
}

async function fetchJsonBody(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS) });
  if (!response.ok) {
    throw new UpstreamFailure(`status ${response.status}`);
  }
  const body = await response.json();
  if (body === null || typeof body !== 'object') {
    throw new UpstreamFailure(INVALID_PAYLOAD_REASON);
  }
  return body;
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validateForecastPayload(body) {
  if (!isPlainObject(body) || FORECAST_SECTIONS.some((section) => !isPlainObject(body[section]))) {
    throw new UpstreamFailure(INVALID_PAYLOAD_REASON);
  }
}

async function requestJson(serviceName, url, validatePayload) {
  const startedAt = Date.now();
  try {
    const body = await fetchJsonBody(url);
    if (validatePayload) {
      validatePayload(body);
    }
    return body;
  } catch (error) {
    logUpstreamFailure(serviceName, describeFailure(error), Date.now() - startedAt);
    throw new HttpError(UPSTREAM_STATUS, UPSTREAM_CODE, UPSTREAM_MESSAGE);
  }
}

function toGeocodedPlace(result) {
  return {
    name: result.name,
    region: result.admin1 ?? result.country ?? null,
    country: result.country ?? null,
    latitude: result.latitude,
    longitude: result.longitude
  };
}

async function geocodeCity(name) {
  const body = await requestJson(GEOCODING_SERVICE, buildGeocodingUrl(name));
  if (!Array.isArray(body.results) || body.results.length === 0) {
    return null;
  }
  const [firstResult] = body.results;
  return toGeocodedPlace(firstResult);
}

function fetchForecast(coordinates) {
  return requestJson(FORECAST_SERVICE, buildForecastUrl(coordinates), validateForecastPayload);
}

module.exports = { geocodeCity, fetchForecast, buildGeocodingUrl, buildForecastUrl };
