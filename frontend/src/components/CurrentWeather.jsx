import React from 'react';
import { weatherCodes } from '../utils/weatherCodes';
import WeatherIcon from './WeatherIcon';
import './CurrentWeather.css';

export default function CurrentWeather({ data, dailyData }) {
  if (!data) return null;

  const uvIndex = dailyData?.uv_index_max?.[0] ?? 0;

  return (
    <div className="current-weather">
      <div className="current-weather__main">
        <WeatherIcon code={data.weather_code} isDay={data.is_day === 1} />
        <div className="current-weather__temp">
          <span className="current-weather__temp-value">{Math.round(data.temperature_2m)}</span>
          <span className="current-weather__temp-unit">°C</span>
        </div>
        <p className="current-weather__label">{weatherCodes.getLabel(data.weather_code)}</p>
      </div>

      <div className="current-weather__cards">
        <div className="current-weather__card">
          <span className="current-weather__card-label">Umidade</span>
          <span className="current-weather__card-value">{data.relative_humidity_2m}%</span>
        </div>

        <div className="current-weather__card">
          <span className="current-weather__card-label">Vento</span>
          <span className="current-weather__card-value">{data.wind_speed_10m} km/h</span>
        </div>

        <div className="current-weather__card">
          <span className="current-weather__card-label">Precipitação</span>
          <span className="current-weather__card-value">{data.precipitation} mm</span>
        </div>

        <div className="current-weather__card">
          <span className="current-weather__card-label">UV</span>
          <span className="current-weather__card-value">{uvIndex}</span>
          <div className="current-weather__uv-bar">
            <div
              className="current-weather__uv-fill"
              style={{ width: `${Math.min((uvIndex / 11) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
