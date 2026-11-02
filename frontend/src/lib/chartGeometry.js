const CHART_WIDTH = 760
const CHART_HEIGHT = 300
const PADDING_LEFT = 44
const PADDING_RIGHT = 16
const PADDING_TOP = 26
const PADDING_BOTTOM = 42
const PLOT_WIDTH = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT
const PLOT_HEIGHT = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM
const BASELINE_Y = CHART_HEIGHT - PADDING_BOTTOM
const TICK_STEP = 4
const HOUR_LABEL_INTERVAL = 3
const MIN_POINTS_FOR_STEP = 2
const MIN_INTERVALS = 1
const CURVE_DIVISOR = 6
const COORDINATE_DECIMALS = 1
const BAR_WIDTH_RATIO = 0.6
const BAR_MAX_HEIGHT_RATIO = 0.3
const BAR_MIN_DOMAIN = 4

function buildFrame() {
  return {
    W: CHART_WIDTH,
    H: CHART_HEIGHT,
    PL: PADDING_LEFT,
    PR: PADDING_RIGHT,
    PT: PADDING_TOP,
    PB: PADDING_BOTTOM,
  }
}

function buildEmptyGeometry() {
  return {
    ...buildFrame(),
    tMin: null,
    tMax: null,
    points: [],
    lineD: '',
    areaD: '',
    yTicks: [],
    xTicks: [],
    nowX: null,
    nowY: null,
    bars: [],
    step: 0,
  }
}

function formatCoordinate(value) {
  return value.toFixed(COORDINATE_DECIMALS)
}

function formatPoint([x, y]) {
  return formatCoordinate(x) + ' ' + formatCoordinate(y)
}

function calculateStep(pointCount) {
  if (pointCount < MIN_POINTS_FOR_STEP) {
    return 0
  }
  return PLOT_WIDTH / (pointCount - 1)
}

function createHorizontalScale(pointCount) {
  const intervals = Math.max(MIN_INTERVALS, pointCount - 1)
  return (index) => PADDING_LEFT + (index * PLOT_WIDTH) / intervals
}

function getTemperatureDomain(temps) {
  const lowest = Math.floor(Math.min(...temps) / TICK_STEP) * TICK_STEP
  const highest = Math.ceil(Math.max(...temps) / TICK_STEP) * TICK_STEP
  return { min: lowest, max: highest === lowest ? highest + TICK_STEP : highest }
}

function createTemperatureScale(domain) {
  const span = domain.max - domain.min
  return (temp) => PADDING_TOP + (1 - (temp - domain.min) / span) * PLOT_HEIGHT
}

function getCurveControlPoints(points, index) {
  const previous = points[index - 1] || points[index]
  const current = points[index]
  const next = points[index + 1]
  const following = points[index + 2] || next
  const firstControl = [
    current[0] + (next[0] - previous[0]) / CURVE_DIVISOR,
    current[1] + (next[1] - previous[1]) / CURVE_DIVISOR,
  ]
  const secondControl = [
    next[0] - (following[0] - current[0]) / CURVE_DIVISOR,
    next[1] - (following[1] - current[1]) / CURVE_DIVISOR,
  ]
  return [firstControl, secondControl]
}

function buildCurveSegment(points, index) {
  const [firstControl, secondControl] = getCurveControlPoints(points, index)
  return (
    'C ' + formatPoint(firstControl) + ', ' + formatPoint(secondControl) + ', ' + formatPoint(points[index + 1])
  )
}

function buildCurvePath(points) {
  const segments = points.slice(1).map((_, offset) => buildCurveSegment(points, offset))
  return ['M ' + formatPoint(points[0]), ...segments].join(' ')
}

function buildAreaPath(lineD, positionX, firstIndex, lastIndex) {
  const lastX = formatCoordinate(positionX(lastIndex))
  const firstX = formatCoordinate(positionX(firstIndex))
  return lineD + ' L ' + lastX + ' ' + BASELINE_Y + ' L ' + firstX + ' ' + BASELINE_Y + ' Z'
}

function buildValueSequence(domain) {
  const count = (domain.max - domain.min) / TICK_STEP + 1
  return Array.from({ length: count }, (_, offset) => domain.min + offset * TICK_STEP)
}

function buildYTicks(domain, positionY) {
  return buildValueSequence(domain).map((value) => ({ value, y: positionY(value) }))
}

function buildXTicks(pointCount, positionX) {
  const count = Math.ceil(pointCount / HOUR_LABEL_INTERVAL)
  const indexes = Array.from({ length: count }, (_, offset) => offset * HOUR_LABEL_INTERVAL)
  return indexes.map((index) => ({ index, x: positionX(index), label: `${index}h` }))
}

function isValidIndex(index, length) {
  return Number.isInteger(index) && index >= 0 && index < length
}

function isValidTemperature(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

function buildNowMarker({ temps, nowIndex, positionX, positionY }) {
  if (!isValidIndex(nowIndex, temps.length) || !isValidTemperature(temps[nowIndex])) {
    return { nowX: null, nowY: null }
  }
  return { nowX: positionX(nowIndex), nowY: positionY(temps[nowIndex]) }
}

function isPositive(value) {
  return typeof value === 'number' && value > 0
}

function buildBars({ precip, step, positionX }) {
  const domainMax = Math.max(BAR_MIN_DOMAIN, ...precip.filter(isPositive))
  const maxHeight = PLOT_HEIGHT * BAR_MAX_HEIGHT_RATIO
  const width = step * BAR_WIDTH_RATIO
  return precip
    .map((value, index) => ({ value, index }))
    .filter(({ value }) => isPositive(value))
    .map(({ value, index }) => {
      const height = (value / domainMax) * maxHeight
      return { index, x: positionX(index) - width / 2, y: BASELINE_Y - height, width, height }
    })
}

function buildPoint(temp, index, positionX, positionY) {
  const y = isValidTemperature(temp) ? positionY(temp) : null
  return [positionX(index), y]
}

export function buildChartGeometry({ temps, precip, nowIndex }) {
  const validIndexes = temps.flatMap((temp, index) => (isValidTemperature(temp) ? [index] : []))
  if (validIndexes.length === 0) {
    return buildEmptyGeometry()
  }
  const domain = getTemperatureDomain(validIndexes.map((index) => temps[index]))
  const step = calculateStep(temps.length)
  const positionX = createHorizontalScale(temps.length)
  const positionY = createTemperatureScale(domain)
  const points = temps.map((temp, index) => buildPoint(temp, index, positionX, positionY))
  const plottedPoints = validIndexes.map((index) => points[index])
  const lineD = buildCurvePath(plottedPoints)
  return {
    ...buildFrame(),
    tMin: domain.min,
    tMax: domain.max,
    points,
    lineD,
    areaD: buildAreaPath(lineD, positionX, validIndexes[0], validIndexes[validIndexes.length - 1]),
    yTicks: buildYTicks(domain, positionY),
    xTicks: buildXTicks(temps.length, positionX),
    ...buildNowMarker({ temps, nowIndex, positionX, positionY }),
    bars: buildBars({ precip, step, positionX }),
    step,
  }
}
