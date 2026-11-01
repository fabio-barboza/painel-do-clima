import React from 'react'
import DayCard from './DayCard.jsx'

function toIndexArray(daily, key) {
  return daily && Array.isArray(daily[key]) ? daily[key] : []
}

function WeeklyForecast({ daily }) {
  const times = toIndexArray(daily, 'time')
  const maxs = toIndexArray(daily, 'temperature_2m_max')
  const mins = toIndexArray(daily, 'temperature_2m_min')
  const rains = toIndexArray(daily, 'precipitation_probability_max')
  const codes = toIndexArray(daily, 'weather_code')

  const days = times.map((time, i) => ({
    time,
    temperature_2m_max: maxs[i],
    temperature_2m_min: mins[i],
    precipitation_probability_max: rains[i],
    weather_code: codes[i],
  }))

  return (
    <section
      className="card"
      style={{ '--d': '.32s' }}
      aria-label="Próximos sete dias"
    >
      <div className="card-head">
        <div>
          <h2>Próximos 7 dias</h2>
          <div className="sub">Previsão diária com probabilidade de chuva</div>
        </div>
      </div>
      <div className="weekly-grid">
        {days.map((day, i) => (
          <DayCard key={day.time ?? i} day={day} index={i} />
        ))}
      </div>
    </section>
  )
}

export default WeeklyForecast
