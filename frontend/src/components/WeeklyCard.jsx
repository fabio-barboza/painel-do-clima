import React from 'react'
import DayCard from './DayCard.jsx'
import useReveal from '../hooks/useReveal.js'
import {
  formatDayDate,
  formatDayLabel,
  formatDegrees,
  formatRainSummary,
  getCommonScale,
  getDatePart,
  getRangeBox,
} from '../lib/format.js'
import { getWeatherInfo } from '../lib/weatherCodes.js'

const CARD_DELAY = '.32s'

function buildDayEntries(daily, todayText) {
  const scale = getCommonScale(daily.temperature_2m_min, daily.temperature_2m_max)
  return daily.time.map((date, index) => {
    const condition = getWeatherInfo(daily.weather_code[index])
    return {
      key: date,
      label: formatDayLabel(date, todayText),
      isToday: date === todayText,
      dateLabel: formatDayDate(date),
      icon: condition.icon,
      color: condition.color,
      maximum: formatDegrees(daily.temperature_2m_max[index]),
      minimum: formatDegrees(daily.temperature_2m_min[index]),
      rain: formatRainSummary(daily.precipitation_probability_max[index], daily.precipitation_sum[index]),
      range: getRangeBox(daily.temperature_2m_min[index], daily.temperature_2m_max[index], scale),
    }
  })
}

function WeeklyCard({ weather }) {
  const [ref, revealed] = useReveal()
  const days = buildDayEntries(weather.daily, getDatePart(weather.current.time))

  return (
    <section
      ref={ref}
      className={revealed ? 'card reveal in' : 'card reveal'}
      style={{ '--d': CARD_DELAY }}
      aria-label="Próximos sete dias"
    >
      <div className="card-head">
        <div>
          <h2>Próximos 7 dias</h2>
          <div className="sub">Previsão diária com probabilidade de chuva</div>
        </div>
      </div>
      <div className="weekly-grid" id="weeklyGrid">
        {days.map((day) => (
          <DayCard key={day.key} day={day} />
        ))}
      </div>
    </section>
  )
}

export default WeeklyCard
