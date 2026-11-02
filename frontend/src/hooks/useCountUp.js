import { useEffect, useState } from 'react'
import { isReducedMotion } from '../lib/motion.js'

const COUNT_DELAY_MS = 450
const COUNT_DURATION_MS = 1400
const CUBIC_EXPONENT = 3
const INITIAL_COUNT = 0

function easeOutCubic(progress) {
  return 1 - (1 - progress) ** CUBIC_EXPONENT
}

export default function useCountUp(target) {
  const [reduced] = useState(isReducedMotion)
  const [counted, setCounted] = useState(INITIAL_COUNT)

  useEffect(() => {
    if (reduced) return undefined

    let frameId = null
    const timerId = setTimeout(() => {
      const startTime = performance.now()

      function tick(now) {
        const progress = Math.min(1, (now - startTime) / COUNT_DURATION_MS)
        setCounted(Math.round(easeOutCubic(progress) * target))
        if (progress < 1) frameId = requestAnimationFrame(tick)
      }

      frameId = requestAnimationFrame(tick)
    }, COUNT_DELAY_MS)

    return () => {
      clearTimeout(timerId)
      if (frameId !== null) cancelAnimationFrame(frameId)
    }
  }, [target, reduced])

  return reduced ? target : counted
}
