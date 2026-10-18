import React from 'react'
import WeatherIcon from './WeatherIcon.jsx'
import UVBar from './UVBar.jsx'
import {
  categorizeWeatherCode,
  getWeatherLabelPt,
  formatTemperature,
  formatHumidity,
  formatWindSpeed,
  formatPrecipitation,
} from '../utils/weatherCode.js'

function CurrentWeather({ current }) {
  const weatherCode = current?.weatherCode
  return (
    <div className="current-weather">
      <div className="current-weather-top">
        <WeatherIcon category={categorizeWeatherCode(weatherCode)} size={64} />
        <div className="current-weather-summary">
          <span className="current-weather-temperature">{formatTemperature(current?.temperature)}</span>
          <span className="current-weather-condition">{getWeatherLabelPt(weatherCode)}</span>
        </div>
      </div>
      <dl className="current-weather-stats">
        <div className="current-weather-stat">
          <dt className="current-weather-stat-label">Umidade</dt>
          <dd className="current-weather-stat-value">{formatHumidity(current?.humidity)}</dd>
        </div>
        <div className="current-weather-stat">
          <dt className="current-weather-stat-label">Vento</dt>
          <dd className="current-weather-stat-value">{formatWindSpeed(current?.windSpeed)}</dd>
        </div>
        <div className="current-weather-stat">
          <dt className="current-weather-stat-label">Precipitação</dt>
          <dd className="current-weather-stat-value">{formatPrecipitation(current?.precipitation)}</dd>
        </div>
      </dl>
      <div className="current-weather-uv">
        <span className="current-weather-stat-label">Índice UV</span>
        <UVBar value={current?.uvIndex} />
      </div>
    </div>
  )
}

export default CurrentWeather
