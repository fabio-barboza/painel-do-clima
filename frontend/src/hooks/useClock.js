import { useEffect, useState } from 'react'

const TICK_MS = 1000

function readNow() {
  const now = new Date()
  const time = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(now)
  const date = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(now)
  return { time, date }
}

function useClock() {
  const [clock, setClock] = useState(readNow)

  useEffect(() => {
    const id = setInterval(() => setClock(readNow()), TICK_MS)
    return () => clearInterval(id)
  }, [])

  return clock
}

export default useClock
