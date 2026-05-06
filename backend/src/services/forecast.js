const FORECAST_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const TIMEOUT_MS = 15000;

const FORECAST_PARAMS = {
  current: 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,is_day',
  hourly: 'temperature_2m,precipitation',
  daily: 'weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum',
  timezone: 'auto',
  forecast_days: '7'
};

async function getForecast(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    ...FORECAST_PARAMS
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${FORECAST_BASE_URL}?${params.toString()}`, {
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Erro ao consultar API de forecast: ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

module.exports = { getForecast };
