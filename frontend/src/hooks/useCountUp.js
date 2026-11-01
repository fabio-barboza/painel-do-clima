import { useEffect, useState } from 'react'

const DUR_MS = 1400
const DELAY_MS = 450

function prefersReducedMotion() {
  return typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function easeOutCubic(progress) {
  return 1 - Math.pow(1 - progress, 3)
}

function useCountUp(target) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    let rafId = null
    const delayId = setTimeout(() => {
      if (prefersReducedMotion()) {
        setValue(target)
        return
      }

      const start = performance.now()

      function animate(now) {
        const progress = Math.min(1, (now - start) / DUR_MS)
        setValue(Math.round(easeOutCubic(progress) * target))
        if (progress < 1) {
          rafId = requestAnimationFrame(animate)
        }
      }

      rafId = requestAnimationFrame(animate)
    }, DELAY_MS)

    return () => {
      clearTimeout(delayId)
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [target])

  return value
}

export default useCountUp
