import React, { useLayoutEffect, useRef, useState } from 'react'
import { buildChartGeometry } from '../lib/chartGeometry.js'
import { formatPrecipitation, formatTemperature, hasValue, MISSING_VALUE } from '../lib/format.js'
import { isReducedMotion } from '../lib/motion.js'

const LINE_TRANSITION = 'stroke-dashoffset 1.8s cubic-bezier(.4,0,.2,1) .25s'
const LINE_DRAWN_OFFSET = '0'
const DRAWN_CLASS = 'show'
const POINT_DELAY_STEP_MS = 45
const POINT_RADIUS = 4
const NOW_RING_RADIUS = 7
const NOW_DOT_RADIUS = 4.5
const HOVER_DOT_RADIUS = 5.5
const BAR_CORNER_RADIUS = 2
const TOOLTIP_EDGE_MIN = 56
const HALF_DIVISOR = 2
const Y_LABEL_GAP = 10
const Y_LABEL_BASELINE = 4
const X_LABEL_OFFSET = 24
const NOW_LABEL_OFFSET = 40
const FIRST_INDEX = 0
const NO_POSITION = 0
const HIDDEN_POINT = [NO_POSITION, NO_POSITION]
const VISIBLE_OPACITY = 1
const HIDDEN_OPACITY = 0
const HOUR_START = 11
const HOUR_END = 13
const TEMPERATURE_UNIT = '°C'
const NOW_SUFFIX = ' · agora'

function joinClasses(baseClass, drawn) {
  return drawn ? `${baseClass} ${DRAWN_CLASS}` : baseClass
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value))
}

function formatHourLabel(time) {
  return `${time.slice(HOUR_START, HOUR_END)}h`
}

function prepareLine(line) {
  const length = line.getTotalLength()
  line.style.strokeDasharray = length
  line.style.strokeDashoffset = length
}

function animateLine(line) {
  line.style.transition = LINE_TRANSITION
  line.style.strokeDashoffset = LINE_DRAWN_OFFSET
}

function startDrawing(line, onDrawn) {
  if (isReducedMotion()) {
    const frame = window.requestAnimationFrame(onDrawn)
    return () => window.cancelAnimationFrame(frame)
  }
  prepareLine(line)
  let pendingFrame = window.requestAnimationFrame(() => {
    pendingFrame = window.requestAnimationFrame(() => {
      animateLine(line)
      onDrawn()
    })
  })
  return () => window.cancelAnimationFrame(pendingFrame)
}

function useLineDrawing(lineRef, revealed) {
  const [drawn, setDrawn] = useState(false)

  useLayoutEffect(() => {
    if (!revealed) return undefined
    return startDrawing(lineRef.current, () => setDrawn(true))
  }, [revealed, lineRef])

  return drawn
}

function findHourIndex({ clientX, rect, geometry }) {
  if (geometry.step === 0) return FIRST_INDEX
  const pointerX = ((clientX - rect.left) / rect.width) * geometry.W
  const rawIndex = Math.round((pointerX - geometry.PL) / geometry.step)
  return clamp(rawIndex, FIRST_INDEX, geometry.points.length - 1)
}

function measureElementWidth(element) {
  return element ? element.offsetWidth : NO_POSITION
}

function buildHoverState({ clientX, rect, geometry }) {
  const index = findHourIndex({ clientX, rect, geometry })
  const [pointX, pointY] = geometry.points[index]
  const anchorY = pointY === null ? geometry.PT : pointY
  return {
    index,
    anchorX: (pointX / geometry.W) * rect.width,
    rectWidth: rect.width,
    top: (anchorY / geometry.H) * rect.height,
  }
}

function buildTipLeft(hover, tipWidth) {
  const edge = Math.max(TOOLTIP_EDGE_MIN, tipWidth / HALF_DIVISOR)
  return clamp(hover.anchorX, edge, hover.rectWidth - edge)
}

function buildTipStyle(hover, visible, tipWidth) {
  if (!hover) return { opacity: HIDDEN_OPACITY }
  return {
    left: buildTipLeft(hover, tipWidth),
    top: hover.top,
    opacity: visible ? VISIBLE_OPACITY : HIDDEN_OPACITY,
  }
}

function useHourHover({ geometry, tipRef }) {
  const [hover, setHover] = useState(null)
  const [visible, setVisible] = useState(false)
  const [tipWidth, setTipWidth] = useState(NO_POSITION)
  const hoverIndex = hover ? hover.index : null

  useLayoutEffect(() => {
    setTipWidth(measureElementWidth(tipRef.current))
  }, [hoverIndex, visible, tipRef])

  const hideHover = () => setVisible(false)

  const showHoverAt = (clientX, element) => {
    if (geometry.points.length === FIRST_INDEX) return
    const rect = element.getBoundingClientRect()
    setHover(buildHoverState({ clientX, rect, geometry }))
    setVisible(true)
  }

  const handleTouch = (event) => {
    const touch = event.touches[FIRST_INDEX]
    if (touch) showHoverAt(touch.clientX, event.currentTarget)
  }

  return {
    hover,
    visible,
    tipWidth,
    handlers: {
      onMouseMove: (event) => showHoverAt(event.clientX, event.currentTarget),
      onMouseLeave: hideHover,
      onTouchStart: handleTouch,
      onTouchMove: handleTouch,
      onTouchEnd: hideHover,
    },
  }
}

function ChartDefinitions() {
  return (
    <defs>
      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#6ee7ff" />
        <stop offset="1" stopColor="#a78bfa" />
      </linearGradient>
      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="rgba(110,231,255,.30)" />
        <stop offset="1" stopColor="rgba(110,231,255,0)" />
      </linearGradient>
    </defs>
  )
}

function ChartGrid({ geometry }) {
  const baselineLabelY = geometry.H - geometry.PB + X_LABEL_OFFSET
  return (
    <>
      {geometry.yTicks.map(({ value, y }) => (
        <React.Fragment key={value}>
          <line className="grid-line" x1={geometry.PL} y1={y} x2={geometry.W - geometry.PR} y2={y} />
          <text className="axis-label" x={geometry.PL - Y_LABEL_GAP} y={y + Y_LABEL_BASELINE} textAnchor="end">
            {value}°
          </text>
        </React.Fragment>
      ))}
      {geometry.xTicks.map(({ index, x, label }) => (
        <text key={index} className="axis-label" x={x} y={baselineLabelY} textAnchor="middle">
          {label}
        </text>
      ))}
      {geometry.nowX !== null && (
        <text
          className="axis-label now-label"
          x={geometry.nowX}
          y={geometry.H - geometry.PB + NOW_LABEL_OFFSET}
          textAnchor="middle"
        >
          agora
        </text>
      )}
    </>
  )
}

function PrecipitationBars({ bars, drawn }) {
  return (
    <>
      {bars.map(({ index, x, y, width, height }) => (
        <rect
          key={index}
          className={joinClasses('precip-bar', drawn)}
          x={x}
          y={y}
          width={width}
          height={height}
          rx={BAR_CORNER_RADIUS}
        />
      ))}
    </>
  )
}

function NowMarker({ geometry }) {
  if (geometry.nowX === null) return null
  return (
    <>
      <line className="now-line" x1={geometry.nowX} y1={geometry.PT} x2={geometry.nowX} y2={geometry.H - geometry.PB} />
      <circle className="now-ring" cx={geometry.nowX} cy={geometry.nowY} r={NOW_RING_RADIUS} />
      <circle className="now-dot" cx={geometry.nowX} cy={geometry.nowY} r={NOW_DOT_RADIUS} />
    </>
  )
}

function ChartPoints({ points, drawn }) {
  return (
    <>
      {points.map(([x, y], index) =>
        y === null ? null : (
          <circle
            key={index}
            className={joinClasses('pt', drawn)}
            cx={x}
            cy={y}
            r={POINT_RADIUS}
            style={{ transitionDelay: `${index * POINT_DELAY_STEP_MS}ms` }}
          />
        ),
      )}
    </>
  )
}

function formatTooltipTemperature(temperature) {
  if (!hasValue(temperature)) return MISSING_VALUE
  return `${formatTemperature(temperature)}${TEMPERATURE_UNIT}`
}

function TooltipContent({ time, temperature, precipitation, isNow }) {
  return (
    <>
      {formatHourLabel(time)} · <b>{formatTooltipTemperature(temperature)}</b> · {formatPrecipitation(precipitation)}
      {isNow ? NOW_SUFFIX : null}
    </>
  )
}

function HourlyChart({ times, temps, precip, nowIndex, revealed }) {
  const geometry = buildChartGeometry({ temps, precip, nowIndex })
  const lineRef = useRef(null)
  const tipRef = useRef(null)
  const drawn = useLineDrawing(lineRef, revealed)
  const { hover, visible, tipWidth, handlers } = useHourHover({ geometry, tipRef })
  const [hoverX, hoverY] = hover ? geometry.points[hover.index] : HIDDEN_POINT
  const guideOpacity = visible ? VISIBLE_OPACITY : HIDDEN_OPACITY
  const hoverDotOpacity = hoverY === null ? HIDDEN_OPACITY : guideOpacity

  return (
    <>
      <svg
        id="chartSvg"
        viewBox={`0 0 ${geometry.W} ${geometry.H}`}
        role="img"
        aria-label="Gráfico de temperatura por hora"
        {...handlers}
      >
        <ChartDefinitions />
        <ChartGrid geometry={geometry} />
        <PrecipitationBars bars={geometry.bars} drawn={drawn} />
        <path className={joinClasses('area-path', drawn)} d={geometry.areaD} />
        <path ref={lineRef} className="line-path" d={geometry.lineD} />
        <NowMarker geometry={geometry} />
        <ChartPoints points={geometry.points} drawn={drawn} />
        <line
          className="guide"
          x1={hoverX}
          x2={hoverX}
          y1={geometry.PT}
          y2={geometry.H - geometry.PB}
          style={{ opacity: guideOpacity }}
        />
        <circle className="hoverdot" cx={hoverX} cy={hoverY} r={HOVER_DOT_RADIUS} style={{ opacity: hoverDotOpacity }} />
      </svg>
      <div className="tip" ref={tipRef} style={buildTipStyle(hover, visible, tipWidth)}>
        {hover && (
          <TooltipContent
            time={times[hover.index]}
            temperature={temps[hover.index]}
            precipitation={precip[hover.index]}
            isNow={hover.index === nowIndex}
          />
        )}
      </div>
    </>
  )
}

export default HourlyChart
