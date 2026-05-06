import React from 'react';
import { weatherCodes } from '../utils/weatherCodes';

export default function WeatherIcon({ code, isDay = true }) {
  const iconName = weatherCodes.getIconName(code);

  if (iconName === 'clear') {
    return isDay ? <SunIcon /> : <MoonIcon />;
  }

  if (iconName === 'mostly-clear' || iconName === 'partly-cloudy') {
    return isDay ? <PartlyCloudyDayIcon /> : <PartlyCloudyNightIcon />;
  }

  if (iconName === 'overcast') {
    return <CloudIcon />;
  }

  if (iconName === 'fog') {
    return <FogIcon />;
  }

  if (iconName === 'drizzle' || iconName === 'freezing-drizzle') {
    return <DrizzleIcon />;
  }

  if (iconName === 'rain' || iconName === 'freezing-rain') {
    return <RainIcon />;
  }

  if (iconName === 'snow' || iconName === 'hail') {
    return <SnowIcon />;
  }

  if (iconName === 'thunderstorm') {
    return <ThunderstormIcon />;
  }

  return <UnknownIcon />;
}

function SunIcon() {
  return (
    <svg className="weather-icon weather-icon--sun" width="64" height="64" viewBox="0 0 64 64" fill="none">
      <circle className="weather-icon__sun-core" cx="32" cy="32" r="14" fill="#F9A825" />
      <g className="weather-icon__sun-rays">
        <line x1="32" y1="4" x2="32" y2="14" stroke="#F9A825" strokeWidth="3" strokeLinecap="round" />
        <line x1="32" y1="50" x2="32" y2="60" stroke="#F9A825" strokeWidth="3" strokeLinecap="round" />
        <line x1="4" y1="32" x2="14" y2="32" stroke="#F9A825" strokeWidth="3" strokeLinecap="round" />
        <line x1="50" y1="32" x2="60" y2="32" stroke="#F9A825" strokeWidth="3" strokeLinecap="round" />
        <line x1="12.2" y1="12.2" x2="19.3" y2="19.3" stroke="#F9A825" strokeWidth="3" strokeLinecap="round" />
        <line x1="44.7" y1="44.7" x2="51.8" y2="51.8" stroke="#F9A825" strokeWidth="3" strokeLinecap="round" />
        <line x1="51.8" y1="12.2" x2="44.7" y2="19.3" stroke="#F9A825" strokeWidth="3" strokeLinecap="round" />
        <line x1="19.3" y1="44.7" x2="12.2" y2="51.8" stroke="#F9A825" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="weather-icon" width="64" height="64" viewBox="0 0 64 64" fill="none">
      <path className="weather-icon__moon" d="M38 12C28 12 20 20 20 30s8 18 18 18c3.5 0 6.8-1 9.6-2.8C43.8 49.2 39.2 51 34 51 22.954 51 14 42.046 14 31s8.954-20 20-20c5.2 0 9.8 1.8 13.6 4.8C44.8 13 41.5 12 38 12z" fill="#B0BEC5" />
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg className="weather-icon weather-icon--cloud" width="64" height="64" viewBox="0 0 64 64" fill="none">
      <path className="weather-icon__cloud" d="M20 44h28a12 12 0 10-4-23.3A16 16 0 0020 30a10 10 0 000 14z" fill="#9E9E9E" />
    </svg>
  );
}

function PartlyCloudyDayIcon() {
  return (
    <svg className="weather-icon" width="64" height="64" viewBox="0 0 64 64" fill="none">
      <circle cx="22" cy="22" r="10" fill="#F9A825" className="weather-icon__sun-small" />
      <path d="M24 48h24a10 10 0 10-3.3-19.4A13 13 0 0024 38a8 8 0 000 10z" fill="#9E9E9E" className="weather-icon__cloud" />
    </svg>
  );
}

function PartlyCloudyNightIcon() {
  return (
    <svg className="weather-icon" width="64" height="64" viewBox="0 0 64 64" fill="none">
      <path d="M24 18c-5 0-9 4-9 9s4 9 9 9c1.5 0 3-.4 4.3-1C26.2 37 23.8 38 21 38c-6 0-11-5-11-11s5-11 11-11c2.8 0 5.2 1 7.3 2.8C27 18.4 25.5 18 24 18z" fill="#B0BEC5" />
      <path d="M26 50h22a9 9 0 10-3-17.5A12 12 0 0026 42a7 7 0 000 8z" fill="#9E9E9E" className="weather-icon__cloud" />
    </svg>
  );
}

function FogIcon() {
  return (
    <svg className="weather-icon weather-icon--fog" width="64" height="64" viewBox="0 0 64 64" fill="none">
      <line x1="12" y1="22" x2="52" y2="22" stroke="#B0BEC5" strokeWidth="4" strokeLinecap="round" className="weather-icon__fog-line" />
      <line x1="16" y1="32" x2="48" y2="32" stroke="#B0BEC5" strokeWidth="4" strokeLinecap="round" className="weather-icon__fog-line" />
      <line x1="12" y1="42" x2="52" y2="42" stroke="#B0BEC5" strokeWidth="4" strokeLinecap="round" className="weather-icon__fog-line" />
    </svg>
  );
}

function DrizzleIcon() {
  return (
    <svg className="weather-icon weather-icon--drizzle" width="64" height="64" viewBox="0 0 64 64" fill="none">
      <path d="M18 36h28a10 10 0 10-3.3-19.4A14 14 0 0018 28a8 8 0 000 8z" fill="#78909C" />
      <line x1="22" y1="42" x2="22" y2="48" stroke="#42A5F5" strokeWidth="2" strokeLinecap="round" className="weather-icon__drop" />
      <line x1="32" y1="44" x2="32" y2="50" stroke="#42A5F5" strokeWidth="2" strokeLinecap="round" className="weather-icon__drop weather-icon__drop--delay-1" />
      <line x1="42" y1="42" x2="42" y2="48" stroke="#42A5F5" strokeWidth="2" strokeLinecap="round" className="weather-icon__drop weather-icon__drop--delay-2" />
    </svg>
  );
}

function RainIcon() {
  return (
    <svg className="weather-icon weather-icon--rain" width="64" height="64" viewBox="0 0 64 64" fill="none">
      <path d="M16 34h32a12 12 0 10-4-23.3A16 16 0 0016 26a9 9 0 000 8z" fill="#607D8B" />
      <line x1="20" y1="40" x2="20" y2="50" stroke="#1E88E5" strokeWidth="3" strokeLinecap="round" className="weather-icon__rain" />
      <line x1="32" y1="42" x2="32" y2="52" stroke="#1E88E5" strokeWidth="3" strokeLinecap="round" className="weather-icon__rain weather-icon__rain--delay-1" />
      <line x1="44" y1="40" x2="44" y2="50" stroke="#1E88E5" strokeWidth="3" strokeLinecap="round" className="weather-icon__rain weather-icon__rain--delay-2" />
    </svg>
  );
}

function SnowIcon() {
  return (
    <svg className="weather-icon weather-icon--snow" width="64" height="64" viewBox="0 0 64 64" fill="none">
      <path d="M18 34h28a10 10 0 10-3.3-19.4A14 14 0 0018 26a8 8 0 000 8z" fill="#9E9E9E" />
      <circle cx="22" cy="46" r="3" fill="#E0E0E0" className="weather-icon__snowflake" />
      <circle cx="32" cy="48" r="3" fill="#E0E0E0" className="weather-icon__snowflake weather-icon__snowflake--delay-1" />
      <circle cx="42" cy="46" r="3" fill="#E0E0E0" className="weather-icon__snowflake weather-icon__snowflake--delay-2" />
    </svg>
  );
}

function ThunderstormIcon() {
  return (
    <svg className="weather-icon weather-icon--thunder" width="64" height="64" viewBox="0 0 64 64" fill="none">
      <path d="M16 30h32a12 12 0 10-4-23.3A16 16 0 0016 22a9 9 0 000 8z" fill="#5C6BC0" />
      <polygon points="30,32 24,46 30,46 26,58 40,42 34,42 38,32" fill="#F9A825" className="weather-icon__lightning" />
    </svg>
  );
}

function UnknownIcon() {
  return (
    <svg className="weather-icon" width="64" height="64" viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="20" stroke="#9E9E9E" strokeWidth="2" fill="none" />
      <text x="32" y="38" textAnchor="middle" fill="#9E9E9E" fontSize="18">?</text>
    </svg>
  );
}
