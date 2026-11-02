import React from 'react'
import Icon from './Icon.jsx'

function StatCard({ icon, color, label, value, valueId, barClassName, barStyle }) {
  return (
    <div className="card stat">
      <div className="stat-top">
        <span className="stat-ico" style={{ color }}>
          <Icon name={icon} />
        </span>
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-val" id={valueId}>{value}</div>
      <div className={barClassName}>
        <i style={barStyle}></i>
      </div>
    </div>
  )
}

export default StatCard
