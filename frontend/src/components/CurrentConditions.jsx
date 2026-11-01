import React from 'react'
import { formatTimeFromIso } from '../lib/format.js'
import { weatherCodeInfo } from '../lib/weatherCodes.js'
import useCountUp from '../hooks/useCountUp.js'
import Icon from './Icon.jsx'
import WeatherIconBig from './WeatherIconBig.jsx'

function roundOrNull(value) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : '–'
}

function CurrentConditions({ data }) {
  const { city, current, daily } = data

  const weather = weatherCodeInfo(current.weather_code)
  const locName = city.name ? city.display : 'Sua localização'
  const updatedAt = formatTimeFromIso(current.time)
  const temp = useCountUp(Math.round(current.temperature_2m))
  const maxT = roundOrNull(daily?.temperature_2m_max?.[0])
  const minT = roundOrNull(daily?.temperature_2m_min?.[0])
  const feels = roundOrNull(current.apparent_temperature)

  return (
    <section
      className="card current"
      style={{ '--d': '.08s' }}
      aria-label="Temperatura atual"
    >
      <div className="current-top">
        <span className="loc">
          <Icon name="pin" />
          <span>{locName}</span>
        </span>
        <span className="updated">
          <span className="pulse-dot" />
          Atualizado {updatedAt}
        </span>
      </div>
      <div className="current-main">
        <WeatherIconBig code={current.weather_code} />
        <div className="temp-block">
          <div className="temp">{temp}°</div>
          <div className="condition">{weather.label}</div>
        </div>
      </div>
      <div className="current-foot">
        <span className="chip hot">
          <Icon name="up" /> Máx <b>{maxT}</b>
        </span>
        <span className="chip cold">
          <Icon name="down" /> Mín <b>{minT}</b>
        </span>
        <span className="chip plain">
          Sensação <b>{feels}</b>
        </span>
      </div>
    </section>
  )
}

export default CurrentConditions
