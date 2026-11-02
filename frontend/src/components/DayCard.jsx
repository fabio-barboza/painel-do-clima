import React from 'react'
import Icon from './Icon.jsx'

const TODAY_CLASS = 'd-name today'
const DAY_NAME_CLASS = 'd-name'

function buildRangeStyle(range) {
  return { '--l': `${range.left}%`, '--w': `${range.width}%` }
}

function DayCard({ day }) {
  return (
    <div className="day">
      <span className={day.isToday ? TODAY_CLASS : DAY_NAME_CLASS}>{day.label}</span>
      <span className="d-date">{day.dateLabel}</span>
      <svg className="ico d-ico" style={{ color: day.color }}>
        <use href={`#${day.icon}`} />
      </svg>
      <div className="d-temps">
        <b>{day.maximum}</b>
        <span>{day.minimum}</span>
      </div>
      <div className="d-rain">
        <Icon name="drop" />{' '}
        {day.rain}
      </div>
      <div className="bar d-range">
        <i style={buildRangeStyle(day.range)}></i>
      </div>
    </div>
  )
}

export default DayCard
