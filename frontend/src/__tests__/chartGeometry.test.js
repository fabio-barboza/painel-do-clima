import { buildChartGeometry } from '../lib/chartGeometry.js'

const FRAME = { W: 760, H: 300, PL: 44, PR: 16, PT: 26, PB: 42 }
const PLOT_WIDTH = FRAME.W - FRAME.PL - FRAME.PR
const PLOT_HEIGHT = FRAME.H - FRAME.PT - FRAME.PB
const BASELINE_Y = FRAME.H - FRAME.PB
const SERIES_LENGTH = 24
const NOON_INDEX = 12
const NO_PRECIPITATION = (length) => Array.from({ length }, () => 0)
const SERIES_24 = [14, 14, 13, 13, 12, 12, 13, 15, 17, 19, 21, 22, 24, 25, 26, 26, 25, 24, 22, 20, 18, 17, 15, 14]
const NOT_A_NUMBER = /NaN|Infinity/

function geometryFor(temps, options = {}) {
  return buildChartGeometry({
    temps,
    precip: options.precip ?? NO_PRECIPITATION(temps.length),
    nowIndex: options.nowIndex ?? -1,
  })
}

function countCurveSegments(lineD) {
  return lineD.match(/C /g)?.length ?? 0
}

function collectNumbers(value) {
  if (typeof value === 'number') {
    return [value]
  }
  if (Array.isArray(value)) {
    return value.flatMap(collectNumbers)
  }
  if (value !== null && typeof value === 'object') {
    return Object.values(value).flatMap(collectNumbers)
  }
  return []
}

function allNumbersFinite(value) {
  return collectNumbers(value).every((number) => Number.isFinite(number))
}

describe('chart frame constants', () => {
  it('exposes the painel.html frame constants', () => {
    const geometry = geometryFor(SERIES_24)
    expect({ W: geometry.W, H: geometry.H, PL: geometry.PL, PR: geometry.PR, PT: geometry.PT, PB: geometry.PB }).toEqual(
      FRAME,
    )
  })
})

describe('temperature scale', () => {
  it('rounds the domain outwards to multiples of 4', () => {
    const geometry = geometryFor(SERIES_24)
    expect(geometry.tMin).toBe(12)
    expect(geometry.tMax).toBe(28)
  })

  it('places the lowest and highest temperatures on the plot edges', () => {
    const geometry = geometryFor([12, 20, 28])
    expect(geometry.points[0][1]).toBeCloseTo(BASELINE_Y)
    expect(geometry.points[2][1]).toBeCloseTo(FRAME.PT)
  })

  it('creates one y tick every 4 degrees from tMin to tMax', () => {
    const geometry = geometryFor(SERIES_24)
    expect(geometry.yTicks.map((tick) => tick.value)).toEqual([12, 16, 20, 24, 28])
    expect(geometry.yTicks[0].y).toBeCloseTo(BASELINE_Y)
    expect(geometry.yTicks[4].y).toBeCloseTo(FRAME.PT)
  })

  it('adds 4 to tMax when the temperature is constant and a multiple of 4', () => {
    const geometry = geometryFor([20, 20, 20, 20])
    expect(geometry.tMin).toBe(20)
    expect(geometry.tMax).toBe(24)
    expect(NOT_A_NUMBER.test(geometry.lineD)).toBe(false)
  })

  it('keeps the domain when the constant temperature is not a multiple of 4', () => {
    const geometry = geometryFor([21, 21, 21])
    expect(geometry.tMin).toBe(20)
    expect(geometry.tMax).toBe(24)
  })

  it('handles negative temperatures without NaN', () => {
    const geometry = geometryFor([-9, -5, -13, -5])
    expect(geometry.tMin).toBe(-16)
    expect(geometry.tMax).toBe(-4)
    expect(NOT_A_NUMBER.test(geometry.lineD + geometry.areaD)).toBe(false)
    expect(geometry.points.every(([x, y]) => Number.isFinite(x) && Number.isFinite(y))).toBe(true)
  })
})

describe('horizontal scale', () => {
  it('places the first point at PL and the last point at W - PR', () => {
    const geometry = geometryFor(SERIES_24)
    expect(geometry.points[0][0]).toBeCloseTo(FRAME.PL)
    expect(geometry.points[SERIES_24.length - 1][0]).toBeCloseTo(FRAME.W - FRAME.PR)
    expect(geometry.step).toBeCloseTo(PLOT_WIDTH / (SERIES_24.length - 1))
  })

  it('uses the real series length instead of a fixed 23 intervals', () => {
    const temps = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28]
    const geometry = geometryFor(temps)
    expect(geometry.points).toHaveLength(temps.length)
    expect(geometry.points[temps.length - 1][0]).toBeCloseTo(FRAME.W - FRAME.PR)
    expect(geometry.step).toBeCloseTo(PLOT_WIDTH / (temps.length - 1))
  })
})

describe('curve and area', () => {
  it('starts the line with a move command at the first point', () => {
    const geometry = geometryFor(SERIES_24)
    expect(geometry.lineD.startsWith(`M ${FRAME.PL.toFixed(1)} `)).toBe(true)
  })

  it('draws one cubic segment between each pair of points', () => {
    expect(countCurveSegments(geometryFor(SERIES_24).lineD)).toBe(SERIES_24.length - 1)
    expect(countCurveSegments(geometryFor([5, 6, 7]).lineD)).toBe(2)
  })

  it('closes the area on the last real index instead of a fixed index 23', () => {
    const temps = [10, 12, 14, 16, 18]
    const geometry = geometryFor(temps)
    const lastX = (FRAME.PL + PLOT_WIDTH).toFixed(1)
    expect(geometry.areaD.endsWith(` L ${lastX} ${BASELINE_Y} L ${FRAME.PL.toFixed(1)} ${BASELINE_Y} Z`)).toBe(true)
    expect(geometry.areaD.startsWith(geometry.lineD)).toBe(true)
  })

  it('produces a valid line for a single point without NaN', () => {
    const geometry = geometryFor([18])
    expect(geometry.lineD).toBe(`M ${FRAME.PL.toFixed(1)} ${geometry.points[0][1].toFixed(1)}`)
    expect(NOT_A_NUMBER.test(geometry.areaD)).toBe(false)
  })

  it('returns an empty geometry for an empty series', () => {
    const geometry = geometryFor([])
    expect(geometry.points).toEqual([])
    expect(geometry.lineD).toBe('')
    expect(geometry.areaD).toBe('')
    expect(geometry.bars).toEqual([])
    expect(geometry.nowX).toBeNull()
  })
})

describe('x ticks and now marker', () => {
  it('labels every 3 hours starting at 0h', () => {
    const geometry = geometryFor(SERIES_24)
    expect(geometry.xTicks.map((tick) => tick.label)).toEqual(['0h', '3h', '6h', '9h', '12h', '15h', '18h', '21h'])
  })

  it('places the now marker at the x and y of the current hour', () => {
    const geometry = buildChartGeometry({
      temps: SERIES_24,
      precip: NO_PRECIPITATION(SERIES_24.length),
      nowIndex: NOON_INDEX,
    })
    expect(geometry.nowX).toBeCloseTo(geometry.points[NOON_INDEX][0])
    expect(geometry.nowY).toBeCloseTo(geometry.points[NOON_INDEX][1])
  })

  it('returns null now coordinates when the current hour is not in the series', () => {
    const geometry = geometryFor(SERIES_24, { nowIndex: -1 })
    expect(geometry.nowX).toBeNull()
    expect(geometry.nowY).toBeNull()
  })
})

describe('precipitation bars', () => {
  it('creates no bar for zero precipitation', () => {
    expect(geometryFor(SERIES_24).bars).toEqual([])
  })

  it('creates bars only for the hours with precipitation', () => {
    const precip = [0, 2, 0, 8]
    const geometry = geometryFor([10, 11, 12, 13], { precip })
    expect(geometry.bars.map((bar) => bar.index)).toEqual([1, 3])
  })

  it('limits the tallest bar to 30% of the plot height, with domain max(4, largest value)', () => {
    const precip = [0, 2, 0, 8]
    const geometry = geometryFor([10, 11, 12, 13], { precip })
    const maxBarHeight = PLOT_HEIGHT * 0.3
    expect(geometry.bars[1].height).toBeCloseTo(maxBarHeight)
    expect(geometry.bars[0].height).toBeCloseTo((2 / 8) * maxBarHeight)
  })

  it('uses the minimum domain of 4 mm for small values', () => {
    const geometry = geometryFor([10, 11], { precip: [1, 0] })
    expect(geometry.bars[0].height).toBeCloseTo((1 / 4) * PLOT_HEIGHT * 0.3)
  })

  it('sits each bar on the baseline with width 60% of the step', () => {
    const precip = [0, 4, 0, 4]
    const geometry = geometryFor([10, 11, 12, 13], { precip })
    const [bar] = geometry.bars
    expect(bar.y + bar.height).toBeCloseTo(BASELINE_Y)
    expect(bar.width).toBeCloseTo(geometry.step * 0.6)
  })

  it('treats null precipitation as no bar and keeps the path free of NaN', () => {
    const geometry = geometryFor([10, 11, 12], { precip: [null, 3, null] })
    expect(geometry.bars.map((bar) => bar.index)).toEqual([1])
    expect(allNumbersFinite(geometry.bars)).toBe(true)
  })
})

describe('series of a different size', () => {
  it('builds a finite geometry for a 7 point series', () => {
    const geometry = geometryFor([15, 17, 19, 21, 19, 17, 15], { precip: [0, 0, 1, 0, 0, 0, 2], nowIndex: 3 })
    expect(allNumbersFinite(geometry)).toBe(true)
    expect(countCurveSegments(geometry.lineD)).toBe(6)
    expect(geometry.xTicks.map((tick) => tick.index)).toEqual([0, 3, 6])
  })
})
