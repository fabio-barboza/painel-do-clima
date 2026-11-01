import React, { useEffect, useRef, useState } from 'react'
import { computeScales, smoothPath, rainBarHeights } from '../lib/chart.js'
import { formatNumber } from '../lib/format.js'
import useReveal from '../hooks/useReveal.js'

const W = 760
const H = 300
const PL = 44
const PR = 16
const PT = 26
const PB = 42
const POINTS = 24

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function formatPrecip(value) {
  return value % 1 === 0 ? String(value) : formatNumber(value, 1)
}

function hourLabel(iso) {
  return iso ? iso.slice(11, 13) + 'h' : ''
}

function HourlyChart({ hourly, nowIndex = 0 }) {
  const temps = hourly.temperature_2m
  const precips = hourly.precipitation

  const scales = computeScales(temps)
  const { X, Y } = scales
  const step = X(1) - X(0)
  const line = smoothPath(temps.map((t, i) => [X(i), Y(t)]))
  const bottom = H - PB
  const area = line + ` L ${X(23).toFixed(1)} ${bottom} L ${X(0).toFixed(1)} ${bottom} Z`
  const barHeights = rainBarHeights(precips)
  const barWidth = Math.max(6, Math.round(step * 0.42))

  const svgRef = useRef(null)
  const sectionRef = useRef(null)
  const [, visible] = useReveal(sectionRef)
  const [revealed, setRevealed] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [hover, setHover] = useState(null)

  useEffect(() => {
    if (visible && !revealed) setRevealed(true)
  }, [visible, revealed])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = event => setReduced(event.matches)
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  useEffect(() => {
    if (!revealed || reduced) return
    const lineEl = svgRef.current && svgRef.current.querySelector('#linePath')
    if (!lineEl) return
    const len = lineEl.getTotalLength()
    if (!len) return
    lineEl.style.strokeDasharray = String(len)
    lineEl.style.strokeDashoffset = String(len)
    const raf = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        lineEl.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(.4,0,.2,1) .25s'
        lineEl.style.strokeDashoffset = '0'
      })
    })
    return () => window.cancelAnimationFrame(raf)
  }, [revealed, reduced])

  function position(clientX) {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const px = (clientX - rect.left) / rect.width * W
    const idx = clamp(Math.round((px - PL) / step), 0, POINTS - 1)
    const cx = X(idx)
    const cy = Y(temps[idx])
    setHover({
      idx,
      cx,
      cy,
      left: clamp(cx / W * rect.width, 56, rect.width - 56),
      top: cy / H * rect.height
    })
  }

  const gridLines = []
  for (let t = scales.tMin; t <= scales.tMax; t += 4) {
    const gy = scales.Y(t).toFixed(1)
    gridLines.push(
      <line key={`g${t}`} className="grid-line" x1={PL} y1={gy} x2={W - PR} y2={gy} />
    )
    gridLines.push(
      <text key={`a${t}`} className="axis-label" x={PL - 10} y={(scales.Y(t) + 4).toFixed(1)} textAnchor="end">{t}°</text>
    )
  }

  const xLabels = []
  for (let i = 0; i < POINTS; i += 3) {
    xLabels.push(
      <text key={i} className="axis-label" x={X(i).toFixed(1)} y={bottom + 24} textAnchor="middle">{hourLabel(hourly.time[i])}</text>
    )
  }
  xLabels.push(
    <text key="now" className="axis-label now-label" x={X(nowIndex).toFixed(1)} y={bottom + 40} textAnchor="middle">agora</text>
  )

  const bars = precips.map((precip, i) => {
    const height = barHeights[i]
    if (!height) return null
    return (
      <rect
        key={i}
        className={revealed ? 'rain-bar show' : 'rain-bar'}
        data-i={i}
        x={(X(i) - barWidth / 2).toFixed(1)}
        y={(bottom - height).toFixed(1)}
        width={barWidth.toFixed(1)}
        height={height.toFixed(1)}
        rx="2"
        style={{ transitionDelay: `${i * 45}ms` }}
      />
    )
  })

  const dots = temps.map((t, i) => (
    <circle
      key={i}
      className={revealed ? 'pt show' : 'pt'}
      data-i={i}
      cx={X(i).toFixed(1)}
      cy={Y(t).toFixed(1)}
      r="4"
      style={{ transitionDelay: `${i * 45}ms` }}
    />
  ))

  let tipContent = null
  if (hover) {
    tipContent = (
      <>
        <span>{hourLabel(hourly.time[hover.idx])}</span>
        {' · '}
        <b>{temps[hover.idx]}°C</b>
        {' · '}
        {formatPrecip(precips[hover.idx])} mm
        {hover.idx === nowIndex ? (<>{' · agora'}</>) : null}
      </>
    )
  }

  return (
    <section
      ref={sectionRef}
      className="card reveal chart-card"
      style={{ '--d': '.16s' }}
      aria-label="Previsão por hora"
    >
      <div className="card-head">
        <div>
          <h2>Previsão por hora</h2>
          <div className="sub">Temperatura ao longo do dia</div>
        </div>
        <span className="chip plain"><span className="dotline" /> Temperatura (°C)</span>
        <span className="chip plain"><span className="dotline rain" /> Precipitação (mm)</span>
      </div>
      <div className="chart-wrap">
        <svg
          ref={svgRef}
          id="chartSvg"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Gráfico de temperatura e precipitação por hora"
          onMouseMove={e => position(e.clientX, e.clientY)}
          onMouseLeave={() => setHover(null)}
          onTouchStart={e => { if (e.touches[0]) position(e.touches[0].clientX, e.touches[0].clientY) }}
          onTouchMove={e => { if (e.touches[0]) position(e.touches[0].clientX, e.touches[0].clientY) }}
          onTouchEnd={() => setHover(null)}
        >
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
          {gridLines}
          {xLabels}
          <path className={revealed ? 'area-path show' : 'area-path'} id="areaPath" d={area} />
          {bars}
          <path className="line-path" id="linePath" d={line} />
          <line className="now-line" x1={X(nowIndex)} y1={PT} x2={X(nowIndex)} y2={bottom} />
          <circle className="now-ring" cx={X(nowIndex)} cy={Y(temps[nowIndex])} r="7" />
          <circle className="now-dot" cx={X(nowIndex)} cy={Y(temps[nowIndex])} r="4.5" />
          {dots}
          <line
            className="guide"
            id="guide"
            x1={hover ? hover.cx : 0}
            x2={hover ? hover.cx : 0}
            y1={PT}
            y2={bottom}
            style={{ opacity: hover ? 1 : 0 }}
          />
          <circle
            className="hoverdot"
            id="hoverdot"
            r="5.5"
            cx={hover ? hover.cx : 0}
            cy={hover ? hover.cy : 0}
            style={{ opacity: hover ? 1 : 0 }}
          />
        </svg>
        <div className="tip" style={{ opacity: hover ? 1 : 0, left: hover ? `${hover.left}px` : '0px', top: hover ? `${hover.top}px` : '0px' }}>
          {tipContent}
        </div>
      </div>
      <div className="chart-hint">Passe o mouse ou toque no gráfico para ver os detalhes</div>
    </section>
  )
}

export default HourlyChart
