import React from 'react'
import { windCardinal, uvLabel } from '../lib/weatherCodes.js'
import StatCard from './StatCard.jsx'

const FEELS_MIN = -10
const FEELS_MAX = 40
const WIND_MAX = 40
const UV_MAX = 12
const BARS_MIN_PCT = 4

function roundedOrDash(value) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : '–'
}

function clampedBar(pct) {
  if (!Number.isFinite(pct)) return BARS_MIN_PCT
  return Math.min(100, Math.max(BARS_MIN_PCT, pct))
}

function barWidth(value, min, max) {
  const pct = ((value - min) / (max - min)) * 100
  return clampedBar(pct) + '%'
}

function statsCards(data) {
  const { current } = data

  const feels = roundedOrDash(current.apparent_temperature)
  const humidity = roundedOrDash(current.relative_humidity_2m)
  const windSpeed = roundedOrDash(current.wind_speed_10m)
  const windDir = typeof current.wind_direction_10m === 'number' ? current.wind_direction_10m : 0
  const uv = current.uv_index == null || !Number.isFinite(current.uv_index) ? 0 : current.uv_index
  const uvRounded = Math.round(uv)

  return [
    {
      icon: 'thermo',
      color: '#ff9f7a',
      label: 'Sensação térmica',
      value: feels,
      unit: '°C',
      barPercent: barWidth(feels, FEELS_MIN, FEELS_MAX),
    },
    {
      icon: 'drop',
      color: '#7cc4ff',
      label: 'Umidade',
      value: humidity,
      unit: ' %',
      barPercent: barWidth(humidity, 0, 100),
    },
    {
      icon: 'wind',
      color: '#9be8c9',
      label: 'Vento',
      value: windSpeed,
      unit: ` km/h · ${windCardinal(windDir)}`,
      barPercent: barWidth(windSpeed, 0, WIND_MAX),
    },
    {
      icon: 'uv',
      color: '#ffd76a',
      label: 'Índice UV',
      value: uvRounded,
      unit: ` · ${uvLabel(uv)}`,
      barPercent: barWidth(uvRounded, 0, UV_MAX),
    },
  ]
}

function StatsGrid({ data }) {
  const cards = statsCards(data)

  return (
    <section
      className="grid-stats"
      style={{ '--d': '.24s' }}
      aria-label="Detalhes do clima"
    >
      {cards.map((card) => (
        <StatCard
          key={card.label}
          icon={card.icon}
          color={card.color}
          label={card.label}
          value={card.value}
          unit={card.unit}
          barPercent={card.barPercent}
        />
      ))}
    </section>
  )
}

export default StatsGrid
