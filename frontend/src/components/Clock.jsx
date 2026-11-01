import React from 'react'
import useClock from '../hooks/useClock.js'

function Clock() {
  const { time, date } = useClock()

  return (
    <div className="clock">
      <div className="time">{time}</div>
      <div className="date">{date}</div>
    </div>
  )
}

export default Clock
