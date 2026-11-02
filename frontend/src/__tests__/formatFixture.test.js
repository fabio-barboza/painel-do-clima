import { WEATHER_FIXTURE, WEEK, HOURLY } from './fixtures/weather.js'
import {
  BAR_SCALES,
  formatDayDate,
  formatDayLabel,
  formatPrecipitation,
  formatTemperature,
  formatWindSpeed,
  getBarPercentage,
  getCardinalDirection,
  getUvLevel,
  selectTodayHours,
} from '../lib/format.js'
import { getWeatherInfo } from '../lib/weatherCodes.js'

const EXPECTED_WEEKDAY_LABELS = ['Hoje', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const EXPECTED_DATE_LABELS = ['16 ago', '17 ago', '18 ago', '19 ago', '20 ago', '21 ago', '22 ago']
const HOURS_PER_DAY = 24
const PAINEL_NOW_INDEX = 14

describe('today hours from the fixture', () => {
  const today = selectTodayHours(WEATHER_FIXTURE.hourly, WEATHER_FIXTURE.current.time)

  it('selects exactly the 24 hours of the current day', () => {
    expect(today.times).toHaveLength(HOURS_PER_DAY)
    expect(today.temps).toHaveLength(HOURS_PER_DAY)
    expect(today.precip).toHaveLength(HOURS_PER_DAY)
  })

  it('starts at midnight of the current date', () => {
    expect(today.times[0]).toBe('2026-08-16T00:00')
    expect(today.times[HOURS_PER_DAY - 1]).toBe('2026-08-16T23:00')
  })

  it('matches the temperature curve of painel.html', () => {
    expect(today.temps).toEqual(HOURLY)
  })

  it('places the now marker at 14h, the painel.html position', () => {
    expect(today.nowIndex).toBe(PAINEL_NOW_INDEX)
    expect(today.times[today.nowIndex]).toBe('2026-08-16T14:00')
  })

  it('formats the current temperature as painel.html shows it', () => {
    expect(formatTemperature(today.temps[today.nowIndex])).toBe('26')
  })

  it('formats precipitation of the fixture hours with a decimal comma', () => {
    expect(formatPrecipitation(today.precip[0])).toBe('0,0 mm')
  })
})

describe('seven day cards from the fixture', () => {
  const dates = WEATHER_FIXTURE.daily.time
  const todayText = WEATHER_FIXTURE.current.time.slice(0, 10)

  it('yields seven dates', () => {
    expect(dates).toHaveLength(WEEK.length)
  })

  it('labels the days as painel.html does, starting at Hoje', () => {
    const labels = dates.map((date) => formatDayLabel(date, todayText))
    expect(labels).toEqual(EXPECTED_WEEKDAY_LABELS)
  })

  it('formats the dates as painel.html does', () => {
    const labels = dates.map(formatDayDate)
    expect(labels).toEqual(EXPECTED_DATE_LABELS)
  })

  it('matches the max and min temperatures of painel.html', () => {
    const maxima = WEATHER_FIXTURE.daily.temperature_2m_max.map(formatTemperature)
    const minima = WEATHER_FIXTURE.daily.temperature_2m_min.map(formatTemperature)
    expect(maxima).toEqual(WEEK.map((entry) => String(entry.max)))
    expect(minima).toEqual(WEEK.map((entry) => String(entry.min)))
  })

  it('formats the rain volume of each day with a decimal comma', () => {
    const volumes = WEATHER_FIXTURE.daily.precipitation_sum.map(formatPrecipitation)
    expect(volumes[0]).toBe('2,0 mm')
    expect(volumes).toHaveLength(WEEK.length)
  })

  it('resolves the condition of each day from its WMO code', () => {
    const icons = WEATHER_FIXTURE.daily.weather_code.map((code) => getWeatherInfo(code).icon)
    expect(icons).toEqual(['i-cloud-sun', 'i-rain', 'i-rain', 'i-storm', 'i-sun', 'i-cloud', 'i-cloud-sun'])
  })

  it('keeps the range bars inside the 0 to 100 limits', () => {
    const percentages = WEATHER_FIXTURE.daily.temperature_2m_max.map((value) =>
      getBarPercentage(value, BAR_SCALES.feelsLike),
    )
    percentages.forEach((percentage) => {
      expect(percentage).toBeGreaterThanOrEqual(0)
      expect(percentage).toBeLessThanOrEqual(100)
    })
  })
})

describe('current conditions from the fixture', () => {
  const current = WEATHER_FIXTURE.current

  it('describes the current weather code as painel.html does', () => {
    expect(getWeatherInfo(current.weather_code)).toEqual({
      label: 'Parcialmente nublado',
      icon: 'i-cloud-sun',
      sky: 'reference',
      color: '#ffd76a',
    })
  })

  it('formats the wind and its bar as painel.html does', () => {
    expect(formatWindSpeed(current.wind_speed_10m)).toBe('14')
    expect(getCardinalDirection(current.wind_direction_10m)).toBe('NNO')
    expect(getBarPercentage(current.wind_speed_10m, BAR_SCALES.wind)).toBe(40)
  })

  it('classifies the UV index and its bar as painel.html does', () => {
    expect(getUvLevel(current.uv_index)).toBe('Alto')
    expect(getBarPercentage(current.uv_index, BAR_SCALES.uv)).toBe(50)
  })

  it('scales the humidity and feels-like values of the fixture', () => {
    expect(getBarPercentage(current.relative_humidity_2m, BAR_SCALES.humidity)).toBe(62)
    expect(getBarPercentage(current.apparent_temperature, BAR_SCALES.feelsLike)).toBe(69)
  })
})
