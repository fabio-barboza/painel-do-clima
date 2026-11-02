import React, { useEffect, useState } from 'react'

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

function Clock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="clock">
      <div className="time" id="clockTime">{timeFormatter.format(now)}</div>
      <div className="date" id="clockDate">{dateFormatter.format(now)}</div>
    </div>
  )
}

export default Clock
