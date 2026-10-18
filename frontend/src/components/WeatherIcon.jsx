import React from 'react'

const CLOUD = (
  <g className="wi-cloud-drift">
    <circle cx="22" cy="24" r="10" fill="var(--wi-cloud)" />
    <circle cx="34" cy="20" r="13" fill="var(--wi-cloud)" />
    <circle cx="44" cy="24" r="10" fill="var(--wi-cloud)" />
    <ellipse cx="34" cy="28" rx="18" ry="7" fill="var(--wi-cloud)" />
  </g>
)

const CLOUDS = (
  <>
    <g className="wi-cloud-drift-slow">
      <circle cx="22" cy="26" r="8" fill="var(--wi-cloud-dark)" />
      <circle cx="32" cy="24" r="10" fill="var(--wi-cloud-dark)" />
      <ellipse cx="28" cy="30" rx="12" ry="6" fill="var(--wi-cloud-dark)" />
    </g>
    <g className="wi-cloud-drift">
      <circle cx="22" cy="42" r="10" fill="var(--wi-cloud)" />
      <circle cx="34" cy="38" r="13" fill="var(--wi-cloud)" />
      <circle cx="44" cy="42" r="10" fill="var(--wi-cloud)" />
      <ellipse cx="34" cy="46" rx="18" ry="7" fill="var(--wi-cloud)" />
    </g>
  </>
)

const SUN_CLEAR = (
  <g className="wi-sun-spin">
    <circle cx="32" cy="32" r="11" fill="var(--wi-sun)" />
    <line x1="32" y1="10" x2="32" y2="16" stroke="var(--wi-sun)" strokeWidth="3" strokeLinecap="round" />
    <line x1="32" y1="48" x2="32" y2="54" stroke="var(--wi-sun)" strokeWidth="3" strokeLinecap="round" />
    <line x1="10" y1="32" x2="16" y2="32" stroke="var(--wi-sun)" strokeWidth="3" strokeLinecap="round" />
    <line x1="48" y1="32" x2="54" y2="32" stroke="var(--wi-sun)" strokeWidth="3" strokeLinecap="round" />
    <line x1="16.4" y1="16.4" x2="20.5" y2="20.5" stroke="var(--wi-sun)" strokeWidth="3" strokeLinecap="round" />
    <line x1="43.5" y1="43.5" x2="47.6" y2="47.6" stroke="var(--wi-sun)" strokeWidth="3" strokeLinecap="round" />
    <line x1="16.4" y1="47.6" x2="20.5" y2="43.5" stroke="var(--wi-sun)" strokeWidth="3" strokeLinecap="round" />
    <line x1="43.5" y1="20.5" x2="47.6" y2="16.4" stroke="var(--wi-sun)" strokeWidth="3" strokeLinecap="round" />
  </g>
)

const SUN_PARTLY = (
  <g className="wi-sun-spin">
    <circle cx="20" cy="20" r="9" fill="var(--wi-sun)" />
    <line x1="20" y1="4" x2="20" y2="8" stroke="var(--wi-sun)" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="20" y1="32" x2="20" y2="36" stroke="var(--wi-sun)" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="4" y1="20" x2="8" y2="20" stroke="var(--wi-sun)" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="32" y1="20" x2="36" y2="20" stroke="var(--wi-sun)" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="8.7" y1="8.7" x2="11.3" y2="11.3" stroke="var(--wi-sun)" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="28.7" y1="28.7" x2="31.3" y2="31.3" stroke="var(--wi-sun)" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="8.7" y1="31.3" x2="11.3" y2="28.7" stroke="var(--wi-sun)" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="28.7" y1="11.3" x2="31.3" y2="8.7" stroke="var(--wi-sun)" strokeWidth="2.5" strokeLinecap="round" />
  </g>
)

const PARTLY_CLOUD = (
  <g className="wi-cloud-drift">
    <circle cx="24" cy="40" r="10" fill="var(--wi-cloud)" />
    <circle cx="36" cy="36" r="13" fill="var(--wi-cloud)" />
    <circle cx="46" cy="42" r="9" fill="var(--wi-cloud)" />
    <ellipse cx="36" cy="46" rx="16" ry="7" fill="var(--wi-cloud)" />
  </g>
)

const FOG_LINES = (
  <g className="wi-fog">
    <line x1="14" y1="40" x2="50" y2="40" stroke="var(--wi-fog)" strokeWidth="3" strokeLinecap="round" />
    <line x1="18" y1="47" x2="46" y2="47" stroke="var(--wi-fog)" strokeWidth="3" strokeLinecap="round" />
    <line x1="14" y1="54" x2="50" y2="54" stroke="var(--wi-fog)" strokeWidth="3" strokeLinecap="round" />
  </g>
)

const RAIN_DROPS = (
  <g className="wi-rain">
    <line x1="22" y1="38" x2="19" y2="50" stroke="var(--wi-rain)" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="34" y1="38" x2="31" y2="50" stroke="var(--wi-rain)" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="46" y1="38" x2="43" y2="50" stroke="var(--wi-rain)" strokeWidth="2.5" strokeLinecap="round" />
  </g>
)

const SNOW_FLAKES = (
  <g className="wi-snow">
    <circle cx="22" cy="42" r="3" fill="var(--wi-snow)" />
    <circle cx="34" cy="48" r="3" fill="var(--wi-snow)" />
    <circle cx="46" cy="42" r="3" fill="var(--wi-snow)" />
  </g>
)

const BOLT = (
  <g className="wi-bolt">
    <path d="M 36,34 L 28,46 L 34,46 L 30,58 L 42,42 L 36,42 L 40,34 Z" fill="var(--wi-bolt)" />
  </g>
)

const ICONS = {
  clear: <>{SUN_CLEAR}</>,
  partly: <>{SUN_PARTLY}{PARTLY_CLOUD}</>,
  cloudy: <>{CLOUDS}</>,
  fog: <>{CLOUD}{FOG_LINES}</>,
  rain: <>{CLOUD}{RAIN_DROPS}</>,
  snow: <>{CLOUD}{SNOW_FLAKES}</>,
  thunder: <>{CLOUD}{BOLT}</>,
}

const FALLBACK = (
  <>
    <circle cx="22" cy="36" r="10" fill="var(--wi-cloud)" />
    <circle cx="34" cy="32" r="13" fill="var(--wi-cloud)" />
    <circle cx="44" cy="36" r="10" fill="var(--wi-cloud)" />
    <ellipse cx="34" cy="40" rx="18" ry="7" fill="var(--wi-cloud)" />
  </>
)

function WeatherIcon({ category, size = 48 }) {
  const content = ICONS[category] ?? FALLBACK
  return (
    <svg
      className="weather-icon"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
    >
      {content}
    </svg>
  )
}

export default WeatherIcon
