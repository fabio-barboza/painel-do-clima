import React from 'react';
import WeatherIcon from './WeatherIcon';
import './DailyForecast.css';

function formatDay(isoString, index) {
  if (index === 0) return 'Hoje';
  const date = new Date(isoString + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', { weekday: 'short' });
}

export default function DailyForecast({ dailyData }) {
  if (!dailyData || !dailyData.time) return null;

  const globalMin = Math.min(...dailyData.temperature_2m_min);
  const globalMax = Math.max(...dailyData.temperature_2m_max);
  const range = globalMax - globalMin || 1;

  return (
    <div className="daily-forecast">
      <h3 className="daily-forecast__title section-title">Previsão de 7 dias</h3>
      <div className="daily-forecast__cards">
        {dailyData.time.map((day, index) => {
          const min = dailyData.temperature_2m_min[index];
          const max = dailyData.temperature_2m_max[index];
          const barLeft = ((min - globalMin) / range) * 100;
          const barWidth = ((max - min) / range) * 100;

          return (
            <div key={day} className="daily-forecast__card">
              <span className="daily-forecast__day">{formatDay(day, index)}</span>
              <div className="daily-forecast__icon">
                <WeatherIcon code={dailyData.weather_code[index]} isDay={true} />
              </div>
              <div className="daily-forecast__temp-bar">
                <span className="daily-forecast__temp-min">{Math.round(min)}°</span>
                <div className="daily-forecast__bar-track">
                  <div
                    className="daily-forecast__bar-fill"
                    style={{ left: `${barLeft}%`, width: `${Math.max(barWidth, 4)}%` }}
                  />
                </div>
                <span className="daily-forecast__temp-max">{Math.round(max)}°</span>
              </div>
              <div className="daily-forecast__precipitation">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#42A5F5" strokeWidth="2">
                  <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
                </svg>
                <span>{dailyData.precipitation_sum[index]} mm</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
