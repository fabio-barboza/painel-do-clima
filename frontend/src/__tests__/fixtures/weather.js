export const HOURLY = [14, 14, 13, 13, 12, 12, 13, 15, 17, 19, 21, 22, 24, 25, 26, 26, 25, 24, 22, 20, 18, 17, 15, 14]

export const WEEK = [
  { day: 'Hoje', date: '2026-08-16', code: 2, max: 26, min: 12, rain: 20 },
  { day: 'Seg', date: '2026-08-17', code: 61, max: 22, min: 11, rain: 85 },
  { day: 'Ter', date: '2026-08-18', code: 61, max: 20, min: 10, rain: 90 },
  { day: 'Qua', date: '2026-08-19', code: 95, max: 21, min: 10, rain: 70 },
  { day: 'Qui', date: '2026-08-20', code: 0, max: 27, min: 13, rain: 10 },
  { day: 'Sex', date: '2026-08-21', code: 3, max: 26, min: 13, rain: 25 },
  { day: 'Sáb', date: '2026-08-22', code: 2, max: 25, min: 12, rain: 30 },
]

export const FIXTURE_CURRENT_TIME = '2026-08-16T14:00'

const RAIN_TO_MM_FACTOR = 0.1
const CURRENT_HOUR = 14

function buildHourlyTimes() {
  return WEEK.flatMap((entry) =>
    HOURLY.map((_, hour) => `${entry.date}T${String(hour).padStart(2, '0')}:00`),
  )
}

function buildHourlyTemperatures() {
  return WEEK.flatMap(() => HOURLY)
}

function buildHourlyPrecipitation() {
  return WEEK.flatMap(() => HOURLY.map(() => 0))
}

export const WEATHER_FIXTURE = {
  latitude: -25.43,
  longitude: -49.27,
  timezone: 'America/Sao_Paulo',
  utc_offset_seconds: -10800,
  current: {
    time: FIXTURE_CURRENT_TIME,
    temperature_2m: HOURLY[CURRENT_HOUR],
    relative_humidity_2m: 62,
    apparent_temperature: 28,
    precipitation: 0,
    weather_code: 2,
    wind_speed_10m: 14,
    wind_direction_10m: 337,
    uv_index: 6,
  },
  hourly: {
    time: buildHourlyTimes(),
    temperature_2m: buildHourlyTemperatures(),
    precipitation: buildHourlyPrecipitation(),
  },
  daily: {
    time: WEEK.map((entry) => entry.date),
    weather_code: WEEK.map((entry) => entry.code),
    temperature_2m_max: WEEK.map((entry) => entry.max),
    temperature_2m_min: WEEK.map((entry) => entry.min),
    precipitation_sum: WEEK.map((entry) => entry.rain * RAIN_TO_MM_FACTOR),
    precipitation_probability_max: WEEK.map((entry) => entry.rain),
  },
  location: { name: 'Curitiba', region: 'Paraná', country: 'Brasil' },
}
