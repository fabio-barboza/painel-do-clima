import React from 'react'
import Icon from './Icon.jsx'

function StatCard({ icon, color, label, value, unit, barPercent }) {
  return (
    <div className="card stat">
      <div className="stat-top">
        <span className="stat-ico" style={{ color }}>
          <Icon name={icon} />
        </span>
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-val">
        {value}
        <small>{unit}</small>
      </div>
      <div className="bar">
        <i style={{ '--w': barPercent }} />
      </div>
    </div>
  )
}

export default StatCard
