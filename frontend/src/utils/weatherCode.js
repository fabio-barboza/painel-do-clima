const CATEGORY_BY_CODE = {
  0: 'clear',
  1: 'clear',
  2: 'partly',
  3: 'cloudy',
  45: 'fog',
  48: 'fog',
  51: 'rain',
  53: 'rain',
  55: 'rain',
  56: 'rain',
  57: 'rain',
  61: 'rain',
  63: 'rain',
  65: 'rain',
  66: 'rain',
  67: 'rain',
  71: 'snow',
  73: 'snow',
  75: 'snow',
  77: 'snow',
  80: 'rain',
  81: 'rain',
  82: 'rain',
  85: 'snow',
  86: 'snow',
  95: 'thunder',
  96: 'thunder',
  97: 'thunder',
  99: 'thunder',
}

const THEME_BY_CATEGORY = {
  clear: 'clear',
  partly: 'clear',
  cloudy: 'cloudy',
  fog: 'cloudy',
  rain: 'rain',
  snow: 'rain',
  thunder: 'rain',
}

const LABEL_PT_BY_CODE = {
  0: 'Céu limpo',
  1: 'Predominantemente limpo',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Nevoeiro',
  48: 'Nevoeiro com geada',
  51: 'Garoa fraca',
  53: 'Garoa moderada',
  55: 'Garoa intensa',
  56: 'Garoa congelante fraca',
  57: 'Garoa congelante intensa',
  61: 'Chuva fraca',
  63: 'Chuva moderada',
  65: 'Chuva intensa',
  66: 'Chuva congelante fraca',
  67: 'Chuva congelante intensa',
  71: 'Neve fraca',
  73: 'Neve moderada',
  75: 'Neve intensa',
  77: 'Grãos de neve',
  80: 'Pancadas de chuva fracas',
  81: 'Pancadas de chuva moderadas',
  82: 'Pancadas de chuva intensas',
  85: 'Pancadas de neve fracas',
  86: 'Pancadas de neve intensas',
  95: 'Trovoada',
  96: 'Trovoada com granizo',
  97: 'Trovoada com granizo intenso',
  99: 'Trovoada severa',
}

const WEEKDAYS_PT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

export function categorizeWeatherCode(code) {
  return CATEGORY_BY_CODE[code] ?? 'cloudy'
}

export function getTheme(category) {
  return THEME_BY_CATEGORY[category] ?? 'cloudy'
}

export function getWeatherLabelPt(code) {
  return LABEL_PT_BY_CODE[code] ?? 'Condição desconhecida'
}

export function formatHour(isoTime) {
  const [, time] = isoTime.split('T')
  return time.slice(0, 5)
}

export function formatDayPt(isoDate) {
  const [year, month, day] = isoDate.split('T')[0].split('-').map(Number)
  const weekday = WEEKDAYS_PT[new Date(Date.UTC(year, month - 1, day)).getUTCDay()]
  return `${weekday}., ${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`
}

function isUsableNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

function toHourKey(isoTime) {
  return String(isoTime ?? '').slice(0, 13)
}

function toDateKey(isoTime) {
  return String(isoTime ?? '').slice(0, 10)
}

export function getUvIndex(forecast) {
  const current = forecast?.current
  const hourly = forecast?.hourly
  if (Array.isArray(hourly?.time) && current?.time) {
    const index = hourly.time.findIndex((entry) => toHourKey(entry) === toHourKey(current.time))
    const value = index >= 0 ? hourly.uv_index?.[index] : undefined
    if (isUsableNumber(value)) {
      return value
    }
  }
  const daily = forecast?.daily
  if (Array.isArray(daily?.time) && daily.time.length > 0) {
    const matched = current?.time ? daily.time.findIndex((entry) => toDateKey(entry) === toDateKey(current.time)) : -1
    const index = matched >= 0 ? matched : 0
    if (isUsableNumber(daily.uv_index_max?.[index])) {
      return daily.uv_index_max[index]
    }
  }
  return null
}

export function deriveCurrent(forecast) {
  const current = forecast?.current
  return {
    temperature: current?.temperature_2m,
    humidity: current?.relative_humidity_2m,
    windSpeed: current?.wind_speed_10m,
    uvIndex: getUvIndex(forecast),
    precipitation: current?.precipitation,
    weatherCode: current?.weather_code,
  }
}

export function deriveHourly24(forecast) {
  const hourly = forecast?.hourly
  if (!Array.isArray(hourly?.time)) {
    return []
  }
  return hourly.time.slice(0, 24).map((isoTime, index) => ({
    hour: formatHour(isoTime),
    temperature: hourly.temperature_2m?.[index],
    precipitation: hourly.precipitation?.[index],
  }))
}

export function deriveDaily7(forecast) {
  const daily = forecast?.daily
  if (!Array.isArray(daily?.time)) {
    return []
  }
  return daily.time.slice(0, 7).map((isoDate, index) => ({
    date: isoDate,
    weekday: formatDayPt(isoDate),
    weatherCode: daily.weather_code?.[index],
    tMin: daily.temperature_2m_min?.[index],
    tMax: daily.temperature_2m_max?.[index],
    precipitation: daily.precipitation_sum?.[index],
  }))
}

function formatValue(value, fractionDigits) {
  if (!isUsableNumber(value)) {
    return '—'
  }
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
}

export function formatTemperature(value) {
  return `${formatValue(value, 1)} °C`
}

export function formatHumidity(value) {
  return `${formatValue(value, 0)}%`
}

export function formatWindSpeed(value) {
  return `${formatValue(value, 1)} km/h`
}

export function formatPrecipitation(value) {
  return `${formatValue(value, 1)} mm`
}
