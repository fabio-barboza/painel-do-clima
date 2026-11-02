import { buildChartGeometry } from '../lib/chartGeometry.js'

const FRAME_PL = 44
const FRAME_PT = 26
const BASELINE_Y = 258

function countSegments(pathData) {
  return (pathData.match(/C /g) || []).length
}

function buildGeometry(temps, nowIndex = -1) {
  return buildChartGeometry({ temps, precip: temps.map(() => 0), nowIndex })
}

describe('BugFix #BUG-01: should ignore null temperatures in the scale when an hour has no data', () => {
  it('computes the Y domain only from valid temperatures instead of treating null as 0', () => {
    const geometry = buildGeometry([null, 12, 20, 28])

    expect(geometry.tMin).toBe(12)
    expect(geometry.tMax).toBe(28)
    expect(geometry.yTicks[0].value).toBe(12)
    expect(geometry.yTicks[geometry.yTicks.length - 1].value).toBe(28)
  })

  it('does not place the null hour on the curve at 0 degrees, starting the path at the first valid hour', () => {
    const geometry = buildGeometry([null, 12, 20, 28])
    const firstValidX = geometry.points[1][0]

    expect(geometry.lineD.startsWith(`M ${firstValidX.toFixed(1)} `)).toBe(true)
    expect(geometry.lineD).not.toContain(`M ${FRAME_PL.toFixed(1)} `)
    expect(geometry.areaD.startsWith(`M ${firstValidX.toFixed(1)} `)).toBe(true)
  })

  it('leaves the null hour without a point, keeping its X position for the tooltip guide', () => {
    const geometry = buildGeometry([null, 12, 20, 28])

    expect(geometry.points).toHaveLength(4)
    expect(geometry.points[0][0]).toBeCloseTo(FRAME_PL)
    expect(geometry.points[0][1]).toBeNull()
    expect(geometry.points[1][1]).not.toBeNull()
  })

  it('bridges a null hour in the middle of the series with a single segment between valid neighbours', () => {
    const geometry = buildGeometry([12, null, 20, 28])

    expect(countSegments(geometry.lineD)).toBe(2)
    expect(geometry.lineD).not.toContain('NaN')
    expect(geometry.areaD).not.toContain('NaN')
  })

  it('closes the area on the last valid hour and first valid hour, not on the null edges', () => {
    const geometry = buildGeometry([null, 12, 20, null])
    const firstX = geometry.points[1][0].toFixed(1)
    const lastX = geometry.points[2][0].toFixed(1)

    expect(geometry.areaD).toBe(
      `${geometry.lineD} L ${lastX} ${BASELINE_Y} L ${firstX} ${BASELINE_Y} Z`,
    )
  })

  it('hides the now marker when the current hour has no temperature', () => {
    const geometry = buildGeometry([12, null, 20], 1)

    expect(geometry.nowX).toBeNull()
    expect(geometry.nowY).toBeNull()
  })

  it('keeps the now marker on a valid current hour and maps it to the valid temperature', () => {
    const geometry = buildGeometry([12, null, 20], 2)

    expect(geometry.nowX).toBeCloseTo(geometry.points[2][0])
    expect(geometry.nowY).toBeCloseTo(geometry.points[2][1])
  })

  it('returns an empty curve when no hour has a valid temperature, without NaN', () => {
    const geometry = buildGeometry([null, null])

    expect(geometry.lineD).toBe('')
    expect(geometry.areaD).toBe('')
    expect(geometry.yTicks).toEqual([])
    expect(geometry.lineD + geometry.areaD).not.toContain('NaN')
  })

  it('maps the domain extremes to the plot edges when nulls are ignored', () => {
    const geometry = buildGeometry([null, 12, 20, 28])

    expect(geometry.points[1][1]).toBeCloseTo(BASELINE_Y)
    expect(geometry.points[3][1]).toBeCloseTo(FRAME_PT)
  })
})
