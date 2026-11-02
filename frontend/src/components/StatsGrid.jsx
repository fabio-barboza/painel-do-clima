import React from 'react'
import StatCard from './StatCard.jsx'
import useReveal from '../hooks/useReveal.js'
import {
  BAR_SCALES,
  formatTemperature,
  formatUvIndex,
  formatWindSpeed,
  getBarPercentage,
  getCardinalDirection,
  getUvLevel,
  hasValue,
  MISSING_VALUE,
} from '../lib/format.js'

const GRID_DELAY = '.24s'
const PERCENT_DIVISOR = 100
const UV_FRACTION_MIN = 0.01
const BASE_BAR_CLASS = 'bar'
const UV_BAR_CLASS = 'bar bar-uv'
const FEELS_COLOR = '#ff9f7a'
const HUMIDITY_COLOR = '#7cc4ff'
const WIND_COLOR = '#9be8c9'
const UV_COLOR = '#ffd76a'

function buildWidthStyle(percent) {
  return { '--w': `${percent}%` }
}

function buildUvBarStyle(percent) {
  const fraction = Math.max(UV_FRACTION_MIN, percent / PERCENT_DIVISOR)
  return { '--w': `${percent}%`, '--f': String(fraction) }
}

function buildFeelsValue(temperature) {
  if (!hasValue(temperature)) return MISSING_VALUE
  return <>{formatTemperature(temperature)}<small> °C</small></>
}

function buildHumidityValue(humidity) {
  if (!hasValue(humidity)) return MISSING_VALUE
  return <>{Math.round(humidity)}<small> %</small></>
}

function buildWindValue(speed, degrees) {
  if (!hasValue(speed)) return MISSING_VALUE
  return <>{formatWindSpeed(speed)}<small> km/h · {getCardinalDirection(degrees)}</small></>
}

function buildUvValue(index) {
  if (!hasValue(index)) return MISSING_VALUE
  return <>{formatUvIndex(index)} <small>· {getUvLevel(index)}</small></>
}

function buildStatCards(current) {
  const feelsPercent = getBarPercentage(current.apparent_temperature, BAR_SCALES.feelsLike)
  const humidityPercent = getBarPercentage(current.relative_humidity_2m, BAR_SCALES.humidity)
  const windPercent = getBarPercentage(current.wind_speed_10m, BAR_SCALES.wind)
  const uvPercent = getBarPercentage(current.uv_index, BAR_SCALES.uv)
  return [
    {
      icon: 'thermo',
      color: FEELS_COLOR,
      label: 'Sensação térmica',
      value: buildFeelsValue(current.apparent_temperature),
      valueId: 'statFeels',
      barClassName: BASE_BAR_CLASS,
      barStyle: buildWidthStyle(feelsPercent),
    },
    {
      icon: 'drop',
      color: HUMIDITY_COLOR,
      label: 'Umidade',
      value: buildHumidityValue(current.relative_humidity_2m),
      barClassName: BASE_BAR_CLASS,
      barStyle: buildWidthStyle(humidityPercent),
    },
    {
      icon: 'wind',
      color: WIND_COLOR,
      label: 'Vento',
      value: buildWindValue(current.wind_speed_10m, current.wind_direction_10m),
      barClassName: BASE_BAR_CLASS,
      barStyle: buildWidthStyle(windPercent),
    },
    {
      icon: 'uv',
      color: UV_COLOR,
      label: 'Índice UV',
      value: buildUvValue(current.uv_index),
      barClassName: UV_BAR_CLASS,
      barStyle: buildUvBarStyle(uvPercent),
    },
  ]
}

function StatsGrid({ current }) {
  const [ref, revealed] = useReveal()
  const cards = buildStatCards(current)

  return (
    <section
      ref={ref}
      className={revealed ? 'grid-stats reveal in' : 'grid-stats reveal'}
      style={{ '--d': GRID_DELAY }}
      aria-label="Detalhes do clima"
    >
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </section>
  )
}

export default StatsGrid
