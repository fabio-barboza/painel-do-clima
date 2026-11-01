const { forecastApiUrl, requestTimeoutMs } = require('../config');
const ExternalError = require('./externalError');

const CURRENT_PARAMS = 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,uv_index';
const HOURLY_PARAMS = 'temperature_2m,precipitation,weather_code';
const DAILY_PARAMS = 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,weather_code';
const FORECAST_DAYS = '7';
const TIMEZONE = 'auto';
const WIND_SPEED_UNIT = 'kmh';
const HOURS_IN_WINDOW = 24;
const HOUR_PREFIX_LENGTH = 13;

/**
 * @typedef {Object} Forecast
 * @property {string} timezone
 * @property {number} utc_offset_seconds
 * @property {Object} current
 * @property {Object} hourly
 * @property {Object} daily
 */

/**
 * Fetch the weather forecast for coordinates through Open-Meteo.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<Forecast>}
 */
async function fetchForecast(latitude, longitude) {
  const url = new URL(forecastApiUrl);
  url.searchParams.set('latitude', latitude);
  url.searchParams.set('longitude', longitude);
  url.searchParams.set('current', CURRENT_PARAMS);
  url.searchParams.set('hourly', HOURLY_PARAMS);
  url.searchParams.set('daily', DAILY_PARAMS);
  url.searchParams.set('forecast_days', FORECAST_DAYS);
  url.searchParams.set('timezone', TIMEZONE);
  url.searchParams.set('wind_speed_unit', WIND_SPEED_UNIT);

  let response;
  try {
    response = await fetch(url.href, { signal: AbortSignal.timeout(requestTimeoutMs) });
  } catch (error) {
    if (error && error.name === 'AbortError') {
      throw new ExternalError('Timeout na consulta de previsão.', 502);
    }
    throw new ExternalError('Falha na consulta de previsão.', 502);
  }

  if (!response.ok) {
    throw new ExternalError('Falha na consulta de previsão.', 502);
  }

  const data = await response.json();
  return data;
}

/**
 * Slice the hourly arrays into a rolling 24-hour window starting at the current local hour.
 * @param {Object} hourly - { time: string[], temperature_2m: number[], precipitation: number[], weather_code: number[] }
 * @param {string} currentTime - ISO local datetime, e.g. "2026-10-27T13:30"
 * @returns {Object}
 */
function sliceHourly24(hourly, currentTime) {
  const timeList = (hourly && hourly.time) || [];
  const total = timeList.length;
  if (total === 0) {
    return { time: [], temperature_2m: [], precipitation: [], weather_code: [] };
  }

  const currentPrefix = (currentTime || '').slice(0, HOUR_PREFIX_LENGTH);
  let start = timeList.findIndex((time) => time.startsWith(currentPrefix));
  if (start === -1) {
    start = 0;
  }

  /** @type {{ time: number[], temperature_2m: number[], precipitation: number[], weather_code: number[] }} */
  const slice = { time: [], temperature_2m: [], precipitation: [], weather_code: [] };
  const count = Math.min(HOURS_IN_WINDOW, total);
  for (let i = 0; i < count; i += 1) {
    const index = (start + i) % total;
    slice.time.push(timeList[index]);
    slice.temperature_2m.push(hourly.temperature_2m[index]);
    slice.precipitation.push(hourly.precipitation[index]);
    slice.weather_code.push(hourly.weather_code[index]);
  }

  return slice;
}

module.exports = { fetchForecast, sliceHourly24 };
