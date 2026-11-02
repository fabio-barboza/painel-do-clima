const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export function isReducedMotion() {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.(REDUCED_MOTION_QUERY).matches)
}
