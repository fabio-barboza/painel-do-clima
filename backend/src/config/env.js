const DEFAULT_PORT = 3000;
const DEFAULT_NODE_ENV = 'development';
const DEFAULT_GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com';
const DEFAULT_FORECAST_BASE_URL = 'https://api.open-meteo.com';
const DEFAULT_EXTERNAL_TIMEOUT_MS = 10000;

function parseCorsOrigins(value) {
  if (!value) {
    return [];
  }
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getEnv() {
  const nodeEnv = process.env.NODE_ENV || DEFAULT_NODE_ENV;
  return {
    port: toNumber(process.env.PORT, DEFAULT_PORT),
    nodeEnv,
    corsOrigins: parseCorsOrigins(process.env.CORS_ORIGINS),
    geocodingBaseUrl: process.env.GEOCODING_BASE_URL || DEFAULT_GEOCODING_BASE_URL,
    forecastBaseUrl: process.env.FORECAST_BASE_URL || DEFAULT_FORECAST_BASE_URL,
    externalTimeoutMs: toNumber(process.env.EXTERNAL_TIMEOUT_MS, DEFAULT_EXTERNAL_TIMEOUT_MS)
  };
}

module.exports = { getEnv };
