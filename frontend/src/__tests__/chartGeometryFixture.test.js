import { HOURLY, WEATHER_FIXTURE } from './fixtures/weather.js'
import { buildChartGeometry } from '../lib/chartGeometry.js'
import { selectTodayHours } from '../lib/format.js'

const PAINEL_W = 760
const PAINEL_H = 300
const PAINEL_PL = 44
const PAINEL_PR = 16
const PAINEL_PT = 26
const PAINEL_PB = 42
const PAINEL_NOW_INDEX = 14
const TICK_STEP = 4
const HOURS_PER_DAY = 24
const EXPECTED_Y_TICKS = [12, 16, 20, 24, 28]
const EXPECTED_X_LABELS = ['0h', '3h', '6h', '9h', '12h', '15h', '18h', '21h']
const NOT_A_NUMBER = /NaN|Infinity/

function smoothPainel(points) {
  const segments = ['M ' + points[0][0].toFixed(1) + ' ' + points[0][1].toFixed(1)]
  for (let index = 0; index < points.length - 1; index++) {
    const previous = points[index - 1] || points[index]
    const current = points[index]
    const next = points[index + 1]
    const following = points[index + 2] || next
    const firstX = current[0] + (next[0] - previous[0]) / 6
    const firstY = current[1] + (next[1] - previous[1]) / 6
    const secondX = next[0] - (following[0] - current[0]) / 6
    const secondY = next[1] - (following[1] - current[1]) / 6
    segments.push(
      'C ' + firstX.toFixed(1) + ' ' + firstY.toFixed(1) + ', ' + secondX.toFixed(1) + ' ' + secondY.toFixed(1) +
        ', ' + next[0].toFixed(1) + ' ' + next[1].toFixed(1),
    )
  }
  return segments.join(' ')
}

function referencePainel(values) {
  const minimum = Math.min(...values)
  const maximum = Math.max(...values)
  const tMin = Math.floor(minimum / TICK_STEP) * TICK_STEP
  const tMax = Math.ceil(maximum / TICK_STEP) * TICK_STEP
  const X = (index) => PAINEL_PL + index * (PAINEL_W - PAINEL_PL - PAINEL_PR) / (values.length - 1)
  const Y = (temp) => PAINEL_PT + (1 - (temp - tMin) / (tMax - tMin)) * (PAINEL_H - PAINEL_PT - PAINEL_PB)
  const points = values.map((temp, index) => [X(index), Y(temp)])
  const lineD = smoothPainel(points)
  const lastIndex = values.length - 1
  const areaD = lineD + ' L ' + X(lastIndex).toFixed(1) + ' ' + (PAINEL_H - PAINEL_PB) + ' L ' +
    X(0).toFixed(1) + ' ' + (PAINEL_H - PAINEL_PB) + ' Z'
  return { lineD, areaD, X, Y }
}

function buildTodayGeometry() {
  const today = selectTodayHours(WEATHER_FIXTURE.hourly, WEATHER_FIXTURE.current.time)
  const geometry = buildChartGeometry({
    temps: today.temps,
    precip: today.precip,
    nowIndex: today.nowIndex,
  })
  return { today, geometry }
}

describe('chart geometry from the full fixture', () => {
  it('uses the 24 hours of the current day from format.js', () => {
    const { today, geometry } = buildTodayGeometry()
    expect(today.temps).toHaveLength(HOURS_PER_DAY)
    expect(geometry.points).toHaveLength(HOURS_PER_DAY)
  })

  it('produces a line identical to the painel.html curve for the same series', () => {
    const { geometry } = buildTodayGeometry()
    expect(geometry.lineD).toBe(referencePainel(HOURLY).lineD)
  })

  it('produces an area identical to the painel.html area for the same series', () => {
    const { geometry } = buildTodayGeometry()
    expect(geometry.areaD).toBe(referencePainel(HOURLY).areaD)
  })

  it('keeps the painel.html y scale and grid ticks', () => {
    const { geometry } = buildTodayGeometry()
    const reference = referencePainel(HOURLY)
    expect(geometry.yTicks.map((tick) => tick.value)).toEqual(EXPECTED_Y_TICKS)
    geometry.yTicks.forEach((tick) => {
      expect(tick.y).toBeCloseTo(reference.Y(tick.value))
    })
  })

  it('places the now marker at 14h with the painel.html coordinates', () => {
    const { geometry } = buildTodayGeometry()
    const reference = referencePainel(HOURLY)
    expect(geometry.nowX).toBeCloseTo(reference.X(PAINEL_NOW_INDEX))
    expect(geometry.nowY).toBeCloseTo(reference.Y(HOURLY[PAINEL_NOW_INDEX]))
  })

  it('labels the x axis every 3 hours', () => {
    const { geometry } = buildTodayGeometry()
    expect(geometry.xTicks.map((tick) => tick.label)).toEqual(EXPECTED_X_LABELS)
  })

  it('draws no precipitation bars when the fixture precipitation is zero', () => {
    const { geometry } = buildTodayGeometry()
    expect(geometry.bars).toEqual([])
  })

  it('stays finite when the full weekly series is used', () => {
    const weekly = WEATHER_FIXTURE.hourly
    const geometry = buildChartGeometry({
      temps: weekly.temperature_2m,
      precip: weekly.precipitation,
      nowIndex: 0,
    })
    expect(geometry.lineD).not.toMatch(NOT_A_NUMBER)
    expect(geometry.areaD).not.toMatch(NOT_A_NUMBER)
    expect(geometry.points.flat().every((value) => Number.isFinite(value))).toBe(true)
  })
})
