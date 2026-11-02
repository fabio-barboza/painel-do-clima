export const MISSING_VALUE = '–'

export const BAR_SCALES = Object.freeze({
  feelsLike: Object.freeze({ min: -10, max: 45 }),
  humidity: Object.freeze({ min: 0, max: 100 }),
  wind: Object.freeze({ min: 0, max: 35 }),
  uv: Object.freeze({ min: 0, max: 12 }),
})

const PERCENT_MIN = 0
const PERCENT_MAX = 100
const DEGREES_PER_POINT = 22.5
const CARDINAL_POINTS = Object.freeze([
  'N', 'NNE', 'NE', 'ENE', 'L', 'ESE', 'SE', 'SSE',
  'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO',
])
const UV_LEVELS = Object.freeze([
  Object.freeze({ upTo: 2, label: 'Baixo' }),
  Object.freeze({ upTo: 5, label: 'Moderado' }),
  Object.freeze({ upTo: 7, label: 'Alto' }),
  Object.freeze({ upTo: 10, label: 'Muito alto' }),
])
const UV_EXTREME_LABEL = 'Extremo'
const WEEKDAY_NAMES = Object.freeze(['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'])
const MONTH_NAMES = Object.freeze([
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
])
const TODAY_LABEL = 'Hoje'
const DATE_LENGTH = 10
const HOUR_KEY_LENGTH = 13
const JS_MONTH_OFFSET = 1
const DECIMAL_SEPARATOR = '.'
const PORTUGUESE_DECIMAL_SEPARATOR = ','
const PRECIPITATION_DECIMALS = 1
const PRECIPITATION_UNIT = ' mm'
const DEGREE_SIGN = '°'
const RAIN_SUMMARY_SEPARATOR = ' · '
const RANGE_MIN_WIDTH = 4

function isMissing(value) {
  return value === null || value === undefined
}

export function hasValue(value) {
  return !isMissing(value)
}

function clampPercent(percent) {
  return Math.min(PERCENT_MAX, Math.max(PERCENT_MIN, percent))
}

export function formatTemperature(celsius) {
  if (isMissing(celsius)) {
    return MISSING_VALUE
  }
  return String(Math.round(celsius))
}

export function formatPrecipitation(millimeters) {
  if (isMissing(millimeters)) {
    return MISSING_VALUE
  }
  const fixed = millimeters.toFixed(PRECIPITATION_DECIMALS)
  return fixed.replace(DECIMAL_SEPARATOR, PORTUGUESE_DECIMAL_SEPARATOR) + PRECIPITATION_UNIT
}

export function formatWindSpeed(kilometersPerHour) {
  if (isMissing(kilometersPerHour)) {
    return MISSING_VALUE
  }
  return String(Math.round(kilometersPerHour))
}

export function getCardinalDirection(degrees) {
  if (isMissing(degrees)) {
    return MISSING_VALUE
  }
  const pointIndex = Math.round(degrees / DEGREES_PER_POINT) % CARDINAL_POINTS.length
  return CARDINAL_POINTS[pointIndex]
}

export function formatUvIndex(index) {
  if (isMissing(index)) {
    return MISSING_VALUE
  }
  return String(Math.round(index))
}

export function getUvLevel(index) {
  if (isMissing(index)) {
    return MISSING_VALUE
  }
  const roundedIndex = Math.round(index)
  const matchedLevel = UV_LEVELS.find((level) => roundedIndex <= level.upTo)
  return matchedLevel ? matchedLevel.label : UV_EXTREME_LABEL
}

export function getBarPercentage(value, scale) {
  if (isMissing(value)) {
    return PERCENT_MIN
  }
  const span = scale.max - scale.min
  const ratio = ((value - scale.min) / span) * PERCENT_MAX
  return clampPercent(Math.round(ratio))
}

function parseUtcDate(dateText) {
  const [year, month, day] = dateText.split('-').map(Number)
  return new Date(Date.UTC(year, month - JS_MONTH_OFFSET, day))
}

export function getWeekdayName(dateText) {
  return WEEKDAY_NAMES[parseUtcDate(dateText).getUTCDay()]
}

export function formatDayDate(dateText) {
  const date = parseUtcDate(dateText)
  return `${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]}`
}

export function formatDayLabel(dateText, todayText) {
  if (dateText === todayText) {
    return TODAY_LABEL
  }
  return getWeekdayName(dateText)
}

function pickSeries(series, indexes) {
  return indexes.map((index) => series[index])
}

export function getDatePart(dateTime) {
  return dateTime.slice(0, DATE_LENGTH)
}

export function selectTodayHours(hourly, currentTime) {
  const todayText = getDatePart(currentTime)
  const currentHourKey = currentTime.slice(0, HOUR_KEY_LENGTH)
  const indexes = hourly.time.flatMap((time, index) =>
    time.startsWith(todayText) ? [index] : [],
  )
  const times = pickSeries(hourly.time, indexes)
  return {
    times,
    temps: pickSeries(hourly.temperature_2m, indexes),
    precip: pickSeries(hourly.precipitation, indexes),
    nowIndex: times.findIndex((time) => time.startsWith(currentHourKey)),
  }
}

export function formatDegrees(celsius) {
  if (isMissing(celsius)) {
    return MISSING_VALUE
  }
  return `${formatTemperature(celsius)}${DEGREE_SIGN}`
}

export function formatProbability(percent) {
  if (isMissing(percent)) {
    return MISSING_VALUE
  }
  return `${Math.round(percent)}%`
}

export function formatRainSummary(probability, millimeters) {
  return `${formatProbability(probability)}${RAIN_SUMMARY_SEPARATOR}${formatPrecipitation(millimeters)}`
}

export function getCommonScale(minimums, maximums) {
  const values = [...minimums, ...maximums].filter((value) => !isMissing(value))
  if (values.length === 0) {
    return null
  }
  return { min: Math.min(...values), max: Math.max(...values) }
}

export function getRangeBox(minimum, maximum, scale) {
  if (isMissing(minimum) || isMissing(maximum) || scale === null) {
    return { left: PERCENT_MIN, width: PERCENT_MIN }
  }
  const span = scale.max - scale.min
  if (span <= 0) {
    return { left: PERCENT_MIN, width: PERCENT_MAX }
  }
  const left = clampPercent(Math.round(((minimum - scale.min) / span) * PERCENT_MAX))
  const rawWidth = clampPercent(Math.round(((maximum - minimum) / span) * PERCENT_MAX))
  return { left, width: Math.max(RANGE_MIN_WIDTH, rawWidth) }
}
