import React from 'react'

const SUN_ICON = 'i-sun'
const PARTLY_CLOUDY_ICON = 'i-cloud-sun'
const PARTLY_CLOUDY_CLOUD_ICON = 'i-cloud'

function SunRays() {
  return (
    <svg className="bi-sun" viewBox="0 0 24 24">
      <g className="rotor">
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
      </g>
      <circle cx="12" cy="12" r="4.6" fill="#ffd76a" />
    </svg>
  )
}

function CloudLayer({ icon }) {
  return (
    <svg className="bi-cloud" viewBox="0 0 24 24">
      <use href={`#${icon}`} />
    </svg>
  )
}

function renderPartlyCloudy() {
  return (
    <div className="big-icon" aria-hidden="true">
      <SunRays />
      <CloudLayer icon={PARTLY_CLOUDY_CLOUD_ICON} />
    </div>
  )
}

function renderSun() {
  return (
    <div className="big-icon solo" aria-hidden="true">
      <SunRays />
    </div>
  )
}

function renderSolo(icon) {
  return (
    <div className="big-icon solo" aria-hidden="true">
      <CloudLayer icon={icon} />
    </div>
  )
}

function WeatherIcon({ icon }) {
  if (icon === PARTLY_CLOUDY_ICON) return renderPartlyCloudy()
  if (icon === SUN_ICON) return renderSun()
  return renderSolo(icon)
}

export default WeatherIcon
