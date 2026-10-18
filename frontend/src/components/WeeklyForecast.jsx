import React from 'react'
import WeatherIcon from './WeatherIcon.jsx'
import {
  categorizeWeatherCode,
  formatTemperature,
  formatPrecipitation,
} from '../utils/weatherCode.js'

function isUsableNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

function weekTemperatureBounds(days) {
  const tMins = days.map((day) => day.tMin).filter(isUsableNumber)
  const tMaxs = days.map((day) => day.tMax).filter(isUsableNumber)
  if (tMins.length === 0 || tMaxs.length === 0) {
    return null
  }
  const weekMin = Math.min(...tMins)
  const weekMax = Math.max(...tMaxs)
  return { weekMin, weekMax, span: weekMax - weekMin }
}

function rangeBar(day, bounds) {
  if (!bounds) {
    return { left: 0, width: 100 }
  }
  if (bounds.span <= 0) {
    return { left: 0, width: 100 }
  }
  const low = isUsableNumber(day.tMin) ? day.tMin : day.tMax
  const high = isUsableNumber(day.tMax) ? day.tMax : day.tMin
  const left = ((low - bounds.weekMin) / bounds.span) * 100
  const width = ((high - low) / bounds.span) * 100
  return { left, width }
}

function getMaxWeeklyPrecipitation(days) {
  return days.reduce(
    (max, day) => (isUsableNumber(day.precipitation) ? Math.max(max, day.precipitation) : max),
    0,
  )
}

function precipitationPercent(day, weekMax) {
  if (weekMax <= 0 || !isUsableNumber(day.precipitation) || day.precipitation <= 0) {
    return 0
  }
  return (day.precipitation / weekMax) * 100
}

function WeeklyDay({ day, range, rainPercent }) {
  const min = formatTemperature(day.tMin)
  const max = formatTemperature(day.tMax)
  const rain = formatPrecipitation(day.precipitation)
  return (
    <li className="weekly-day">
      <span className="weekly-day-weekday">{day.weekday}</span>
      <WeatherIcon category={categorizeWeatherCode(day.weatherCode)} size={40} />
      <div className="weekly-day-temps">
        <span className="weekly-day-temp weekly-day-temp-min">{min}</span>
        <span className="weekly-day-temp weekly-day-temp-max">{max}</span>
      </div>
      <div
        className="weekly-day-range"
        role="img"
        aria-label={`Variação de temperatura de ${min} a ${max} em ${day.weekday}`}
      >
        <div className="weekly-day-range-track">
          <div
            className="weekly-day-range-bar"
            style={{ left: `${range.left}%`, width: `${range.width}%` }}
          />
        </div>
      </div>
      <div className="weekly-day-rain">
        <div
          className="weekly-day-rain-track"
          role="img"
          aria-label={`Chuva prevista de ${rain} em ${day.weekday}`}
        >
          <div className="weekly-day-rain-fill" style={{ width: `${rainPercent}%` }} />
        </div>
        <span className="weekly-day-rain-value">{rain}</span>
      </div>
    </li>
  )
}

function WeeklyForecast({ days = [] }) {
  const bounds = weekTemperatureBounds(days)
  const weekMaxPrecipitation = getMaxWeeklyPrecipitation(days)
  return (
    <div className="weekly-forecast">
      <ul className="weekly-forecast-list">
        {days.map((day) => (
          <WeeklyDay
            key={day.date}
            day={day}
            range={rangeBar(day, bounds)}
            rainPercent={precipitationPercent(day, weekMaxPrecipitation)}
          />
        ))}
      </ul>
      <table className="visually-hidden">
        <caption>
          Previsão para os próximos 7 dias: temperatura mínima e máxima em graus Celsius e chuva
          prevista em milímetros
        </caption>
        <thead>
          <tr>
            <th scope="col">Dia</th>
            <th scope="col">Mínima (°C)</th>
            <th scope="col">Máxima (°C)</th>
            <th scope="col">Chuva (mm)</th>
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day.date}>
              <th scope="row">{day.weekday}</th>
              <td>{formatTemperature(day.tMin)}</td>
              <td>{formatTemperature(day.tMax)}</td>
              <td>{formatPrecipitation(day.precipitation)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default WeeklyForecast
