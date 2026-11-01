import React from 'react'
import { formatDayLabel, formatShortDate } from '../lib/format.js'
import { weatherCodeInfo } from '../lib/weatherCodes.js'
import Icon from './Icon.jsx'

function roundOrNull(value) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : '–'
}

function rainLabel(value) {
  return typeof value === 'number' && Number.isFinite(value) ? `${Math.round(value)}%` : '–'
}

function DayCard({ day, index }) {
  const isToday = index === 0
  const weather = weatherCodeInfo(day.weather_code)

  return (
    <div className="day">
      <span className={`d-name${isToday ? ' today' : ''}`}>{formatDayLabel(day.time, index)}</span>
      <span className="d-date">{formatShortDate(day.time)}</span>
      <svg className="ico d-ico" style={{ color: weather.color }}>
        <use href={`#i-${weather.icon}`} />
      </svg>
      <div className="d-temps">
        <b>{roundOrNull(day.temperature_2m_max)}°</b>
        <span>{roundOrNull(day.temperature_2m_min)}°</span>
      </div>
      <div className="d-rain">
        <Icon name="drop" />
        {' '}{rainLabel(day.precipitation_probability_max)}
      </div>
    </div>
  )
}

export default DayCard
