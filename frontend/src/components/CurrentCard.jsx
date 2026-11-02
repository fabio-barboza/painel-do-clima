import React from 'react'
import Chip from './Chip.jsx'
import Icon from './Icon.jsx'
import WeatherIcon from './WeatherIcon.jsx'
import useReveal from '../hooks/useReveal.js'
import useCountUp from '../hooks/useCountUp.js'
import { formatDegrees, formatPrecipitation, hasValue, MISSING_VALUE } from '../lib/format.js'
import { getWeatherInfo } from '../lib/weatherCodes.js'

const FIRST_DAY_INDEX = 0
const DEGREE_SIGN = '°'
const UNCOUNTED_TARGET = 0
const CARD_DELAY = '.08s'

function buildCountTarget(temperature) {
  return hasValue(temperature) ? Math.round(temperature) : UNCOUNTED_TARGET
}

function CurrentCard({ weather, locationLabel }) {
  const [ref, revealed] = useReveal()
  const { current, daily } = weather
  const condition = getWeatherInfo(current.weather_code)
  const countedTemperature = useCountUp(buildCountTarget(current.temperature_2m))

  return (
    <section
      ref={ref}
      className={revealed ? 'card current reveal in' : 'card current reveal'}
      style={{ '--d': CARD_DELAY }}
      aria-label="Temperatura atual"
    >
      <div className="current-top">
        <span className="loc">
          <Icon name="pin" />{' '}
          <span id="locName">{locationLabel}</span>
        </span>
        <span className="updated">
          <span className="pulse-dot"></span>
          {' Atualizado agora'}
        </span>
      </div>
      <div className="current-main">
        <WeatherIcon icon={condition.icon} />
        <div className="temp-block">
          <div className="temp">
            <span id="tempVal">{hasValue(current.temperature_2m) ? countedTemperature : MISSING_VALUE}</span>
            {hasValue(current.temperature_2m) ? DEGREE_SIGN : null}
          </div>
          <div className="condition">{condition.label}</div>
        </div>
      </div>
      <div className="current-foot">
        <Chip tone="hot" icon="up">
          Máx <b id="maxT">{formatDegrees(daily.temperature_2m_max[FIRST_DAY_INDEX])}</b>
        </Chip>
        <Chip tone="cold" icon="down">
          Mín <b id="minT">{formatDegrees(daily.temperature_2m_min[FIRST_DAY_INDEX])}</b>
        </Chip>
        <Chip>
          Sensação <b id="feels">{formatDegrees(current.apparent_temperature)}</b>
        </Chip>
        <Chip icon="drop">
          Precipitação <b>{formatPrecipitation(current.precipitation)}</b>
        </Chip>
      </div>
    </section>
  )
}

export default CurrentCard
