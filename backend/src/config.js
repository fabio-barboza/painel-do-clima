require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const isDev = NODE_ENV === 'development';

const PORT = parseInt(process.env.PORT, 10) || 3000;

const corsOriginsRaw = process.env.CORS_ORIGINS || (isDev ? '*' : '');
const corsOrigins = corsOriginsRaw.split(',').map((value) => value.trim()).filter(Boolean);

const geocodingApiUrl = process.env.GEOCODING_API_URL || 'https://geocoding-api.open-meteo.com/v1/search';
const forecastApiUrl = process.env.FORECAST_API_URL || 'https://api.open-meteo.com/v1/forecast';
const reverseGeocodingApiUrl = process.env.REVERSE_GEOCODING_API_URL || 'https://api.bigdatacloud.net/data/reverse-geocode-client';

const REQUEST_TIMEOUT_MS = 8000;

module.exports = {
  NODE_ENV,
  isDev,
  PORT,
  corsOrigins,
  corsAllowedAnyOrigin: corsOrigins.includes('*') || isDev,
  geocodingApiUrl,
  forecastApiUrl,
  reverseGeocodingApiUrl,
  requestTimeoutMs: REQUEST_TIMEOUT_MS
};
