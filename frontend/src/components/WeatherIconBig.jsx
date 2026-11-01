import React from 'react'
import { weatherCodeInfo } from '../lib/weatherCodes.js'

const SUN_RAYS = (
  <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none">
    <line x1="12" y1="1.8" x2="12" y2="4.2" />
    <line x1="12" y1="19.8" x2="12" y2="22.2" />
    <line x1="1.8" y1="12" x2="4.2" y2="12" />
    <line x1="19.8" y1="12" x2="22.2" y2="12" />
    <line x1="4.8" y1="4.8" x2="6.5" y2="6.5" />
    <line x1="17.5" y1="17.5" x2="19.2" y2="19.2" />
    <line x1="4.8" y1="19.2" x2="6.5" y2="17.5" />
    <line x1="17.5" y1="6.5" x2="19.2" y2="4.8" />
  </g>
)

function sunGlyph() {
  return (
    <svg className="bi-sun" viewBox="0 0 24 24" aria-hidden="true">
      <g className="rotor">{SUN_RAYS}</g>
      <circle cx="12" cy="12" r="4.6" fill="#ffd76a" />
    </svg>
  )
}

function cloudGlyph() {
  return (
    <svg className="bi-cloud" viewBox="0 0 24 24" aria-hidden="true">
      <use href="#i-cloud" />
    </svg>
  )
}

const BIG_COLOR = {
  cloud: '#c9d6f2',
  rain: '#7cc4ff',
  storm: '#c9b8ff',
}

function WeatherIconBig({ code }) {
  const { icon } = weatherCodeInfo(code)

  if (icon === 'cloud-sun') {
    return (
      <div className="big-icon" aria-hidden="true">
        {sunGlyph()}
        {cloudGlyph()}
      </div>
    )
  }

  if (icon === 'sun') {
    return (
      <div className="big-icon" aria-hidden="true">
        {sunGlyph()}
      </div>
    )
  }

  const color = BIG_COLOR[icon] ?? BIG_COLOR.cloud

  return (
    <div className="big-icon" aria-hidden="true">
      <svg className="bi-big bi-float" style={{ color }} viewBox="0 0 24 24" aria-hidden="true">
        <use href={`#i-${icon}`} />
      </svg>
    </div>
  )
}

export default WeatherIconBig
