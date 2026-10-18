const HOURLY_START_ISO = '2026-10-17T12:00:00Z';
const DAILY_START_ISO = '2026-10-17';
const HOURLY_COUNT = 24;
const DAILY_COUNT = 7;
const HOURLY_STEP_MS = 3600000;
const DAILY_STEP_MS = 86400000;
const DAILY_WEATHER_CODES = [2, 3, 61, 80, 95, 1, 0];

function buildHourly(startIso, count) {
  const time = [];
  const temperature_2m = [];
  const precipitation = [];
  const uv_index = [];
  const start = new Date(startIso);
  for (let i = 0; i < count; i += 1) {
    const at = new Date(start.getTime() + i * HOURLY_STEP_MS);
    time.push(`${at.toISOString().slice(0, 13)}:00`);
    temperature_2m.push(Number((16 + Math.sin(i / 3) * 5).toFixed(1)));
    precipitation.push(i % 6 === 0 ? 0.6 : i % 6 === 3 ? 0.2 : 0.0);
    uv_index.push(Number(Math.max(0, 9 - Math.abs(i - 12) / 1.5).toFixed(1)));
  }
  return { time, temperature_2m, precipitation, uv_index };
}

function buildDaily(startIso, count) {
  const time = [];
  const weather_code = [];
  const temperature_2m_min = [];
  const temperature_2m_max = [];
  const precipitation_sum = [];
  const start = new Date(startIso);
  for (let i = 0; i < count; i += 1) {
    const at = new Date(start.getTime() + i * DAILY_STEP_MS);
    time.push(at.toISOString().slice(0, 10));
    weather_code.push(DAILY_WEATHER_CODES[i % DAILY_WEATHER_CODES.length]);
    temperature_2m_min.push(Number((9 + i * 0.6).toFixed(1)));
    temperature_2m_max.push(Number((19 + i * 0.6).toFixed(1)));
    precipitation_sum.push(i % 2 === 1 ? Number((1.5 + i).toFixed(1)) : 0.0);
  }
  return { time, weather_code, temperature_2m_min, temperature_2m_max, precipitation_sum };
}

const geocodingSaoPaulo = {
  results: [
    {
      id: 3448439,
      name: 'São Paulo',
      latitude: -23.5475,
      longitude: -46.6361,
      elevation: 760,
      feature_code: 'PPLC',
      country_code: 'BR',
      admin1_id: 3394753,
      timezone: 'America/Sao_Paulo',
      population: 11451252,
      country: 'Brasil',
      admin1: 'São Paulo'
    }
  ]
};

const geocodingEmpty = {
  results: []
};

const forecast = {
  latitude: -23.5475,
  longitude: -46.6361,
  generation_options: {
    apis: ['best_match'],
    models: ['best_match'],
    timezone: 'America/Sao_Paulo'
  },
  utc_offset_seconds: -10800,
  timezone: 'America/Sao_Paulo',
  elevation: 760,
  current: {
    time: '2026-10-17T12:00',
    interval: 900,
    temperature_2m: 18.3,
    relative_humidity_2m: 72,
    precipitation: 0.0,
    weather_code: 2,
    wind_speed_10m: 11.4
  },
  current_units: {
    time: 'iso8601',
    interval: 'seconds',
    temperature_2m: '°C',
    relative_humidity_2m: '%',
    precipitation: 'mm',
    weather_code: 'wmo code',
    wind_speed_10m: 'km/h'
  },
  hourly: buildHourly(HOURLY_START_ISO, HOURLY_COUNT),
  hourly_units: {
    time: 'iso8601',
    temperature_2m: '°C',
    precipitation: 'mm',
    uv_index: 'Index'
  },
  daily: buildDaily(DAILY_START_ISO, DAILY_COUNT),
  daily_units: {
    time: 'iso8601',
    weather_code: 'wmo code',
    temperature_2m_min: '°C',
    temperature_2m_max: '°C',
    precipitation_sum: 'mm'
  }
};

module.exports = { geocodingSaoPaulo, geocodingEmpty, forecast };
