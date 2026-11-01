const W = 760
const H = 300
const PL = 44
const PR = 16
const PT = 26
const PB = 42
const POINTS = 24
const PLOT = H - PT - PB

export function computeScales(temps) {
  const tMin = Math.floor(Math.min(...temps) / 4) * 4
  const tMax = Math.ceil(Math.max(...temps) / 4) * 4
  const span = tMax - tMin
  const X = i => PL + i * (W - PL - PR) / (POINTS - 1)
  const Y = t => (span === 0 ? PT + PLOT / 2 : PT + (1 - (t - tMin) / span) * PLOT)
  return { tMin, tMax, step: 4, X, Y }
}

export function smoothPath(points) {
  const path = ['M ' + points[0][0].toFixed(1) + ' ' + points[0][1].toFixed(1)]
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] || p2
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    path.push('C ' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ', ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ', ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1))
  }
  return path.join(' ')
}

export function rainBarHeights(precips) {
  return precips.map(precip => {
    if (!precip || precip <= 0) {
      return 0
    }
    const pMax = Math.max(precip, 1) * 1.25
    return Math.max(2, (precip / pMax) * PLOT * 0.28)
  })
}
