import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import HourlyChart from '../components/HourlyChart.jsx'
import { rainBarHeights } from '../lib/chart.js'

const TEMPS = [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19]
const PRECIPS = [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
// Janela rolante: índice 0 = 14h, então índice ≠ hora do dia (como na janela rolante real)
const START_HOUR = 14
const TIMES = TEMPS.map((_, i) => {
  const h = (START_HOUR + i) % 24
  return `2026-10-16T${String(h).padStart(2, '0')}:00`
})

function makeHourly(precips = PRECIPS) {
  return { time: TIMES, temperature_2m: TEMPS, precipitation: precips }
}

const PLOT_H = 232
const SVG_RECT = { left: 0, top: 0, width: 760, height: 300, right: 760, bottom: 300 }

function getChart() {
  return screen.getByLabelText('Previsão por hora')
}

function reveal(section) {
  const instances = window.IntersectionObserver.instances
  for (const obs of instances) {
    if (obs.elements.includes(section)) {
      act(() => { obs.intersect(section) })
      return
    }
  }
}

function sizeSvg(svg) {
  svg.getBoundingClientRect = () => SVG_RECT
}

describe('HourlyChart — unidade', () => {
  test('SVG com 24 pontos .pt', () => {
    render(<HourlyChart hourly={makeHourly()} />)
    expect(getChart().querySelectorAll('.pt').length).toBe(24)
  })

  test('rótulos de hora a cada 3 + "agora" (hora real da janela rolante)', () => {
    render(<HourlyChart hourly={makeHourly()} />)
    // janela rolante a partir de 14h (índice 0); rótulos mostram a hora real, não o índice
    for (const h of ['14h', '17h', '20h', '23h', '02h', '05h', '08h', '11h']) {
      expect(screen.getByText(h)).toBeInTheDocument()
    }
    expect(screen.getByText('agora')).toBeInTheDocument()
  })

  test('rótulos de temperatura a cada 4°C (tMin/tMax múltiplos de 4)', () => {
    render(<HourlyChart hourly={makeHourly()} />)
    expect(screen.getByText('12°')).toBeInTheDocument()
    expect(screen.getByText('28°')).toBeInTheDocument()
  })

  test('marcador "agora" no índice 0', () => {
    render(<HourlyChart hourly={makeHourly()} nowIndex={0} />)
    expect(getChart().querySelector('.now-line')).toBeTruthy()
    expect(getChart().querySelector('.now-ring')).toBeTruthy()
    expect(getChart().querySelector('.now-dot')).toBeTruthy()
  })

  test('role="img" e aria-label descritivo', () => {
    render(<HourlyChart hourly={makeHourly()} />)
    const svg = getChart().querySelector('svg')
    expect(svg.getAttribute('role')).toBe('img')
    expect(svg.getAttribute('aria-label')).toBe('Gráfico de temperatura e precipitação por hora')
  })

  test('barras rain-bar: 1 por hora com p>0, nenhuma para p=0', () => {
    render(<HourlyChart hourly={makeHourly()} />)
    const positive = PRECIPS.filter(p => p > 0).length
    const bars = getChart().querySelectorAll('.rain-bar')
    expect(bars.length).toBe(positive)
    PRECIPS.forEach((p, i) => {
      const rect = getChart().querySelector(`.rain-bar[data-i="${i}"]`)
      if (p > 0) {
        expect(rect).toBeTruthy()
      } else {
        expect(rect).toBeFalsy()
      }
    })
  })

  test('barras conforme rainBarHeights, com piso 6px e teto 28% do plot', () => {
    render(<HourlyChart hourly={makeHourly()} />)
    const heights = rainBarHeights(PRECIPS)
    const positiveIdx = PRECIPS.map((p, i) => [p, i]).filter(([p]) => p > 0).map(([, i]) => i)
    positiveIdx.forEach((i) => {
      const rect = getChart().querySelector(`.rain-bar[data-i="${i}"]`)
      expect(parseFloat(rect.getAttribute('height'))).toBeCloseTo(heights[i], 1)
      expect(parseFloat(rect.getAttribute('width'))).toBeGreaterThanOrEqual(6)
      expect(rect.getAttribute('rx')).toBe('2')
      expect(parseFloat(rect.getAttribute('height'))).toBeLessThanOrEqual(0.28 * PLOT_H)
      const x = parseFloat(rect.getAttribute('x'))
      const w = parseFloat(rect.getAttribute('width'))
      expect(x + w / 2).toBeCloseTo(44 + i * (760 - 44 - 16) / 23, 1)
    })
  })

  test('legenda com 2 chips ("Temperatura (°C)" e "Precipitação (mm)")', () => {
    render(<HourlyChart hourly={makeHourly()} />)
    expect(screen.getByText('Temperatura (°C)')).toBeInTheDocument()
    expect(screen.getByText('Precipitação (mm)')).toBeInTheDocument()
  })
})

describe('HourlyChart — integração', () => {
  test('hover (mousemove) mostra tooltip com hora/temperatura/precipitação e guia/ponto; mouseleave esconde', () => {
    const { container } = render(<HourlyChart hourly={makeHourly()} nowIndex={0} />)
    const svg = container.querySelector('#chartSvg')
    sizeSvg(svg)

    fireEvent.mouseMove(svg, { clientX: 300, clientY: 100 })
    const tipEl = container.querySelector('.tip')
    expect(tipEl.style.opacity).toBe('1')
    expect(tipEl.textContent).toContain('22h')
    expect(tipEl.textContent).toContain('°C')
    expect(tipEl.textContent).toContain('mm')
    expect(container.querySelector('.guide').style.opacity).toBe('1')
    expect(container.querySelector('.hoverdot').style.opacity).toBe('1')

    // guia e ponto de hover são posicionados no ponto hoverado (índice 8 → 22h), não em 0,0
    const guide = container.querySelector('.guide')
    const dot = container.querySelector('.hoverdot')
    const expectedX = 44 + 8 * (760 - 44 - 16) / 23
    expect(parseFloat(guide.getAttribute('x1'))).toBeCloseTo(expectedX, 0)
    expect(parseFloat(guide.getAttribute('x2'))).toBeCloseTo(expectedX, 0)
    expect(parseFloat(dot.getAttribute('cx'))).toBeCloseTo(expectedX, 0)
    expect(parseFloat(dot.getAttribute('cy'))).toBeCloseTo(113, 0)

    fireEvent.mouseLeave(svg)
    expect(container.querySelector('.tip').style.opacity).toBe('0')
    expect(container.querySelector('.guide').style.opacity).toBe('0')
    expect(container.querySelector('.hoverdot').style.opacity).toBe('0')
  })

  test('touchstart mostra tooltip e touchend esconde', () => {
    const { container } = render(<HourlyChart hourly={makeHourly()} nowIndex={0} />)
    const svg = container.querySelector('#chartSvg')
    sizeSvg(svg)

    act(() => { fireEvent.touchStart(svg, { touches: [{ clientX: 300, clientY: 100 }] }) })
    const tipEl = container.querySelector('.tip')
    expect(tipEl.style.opacity).toBe('1')
    expect(tipEl.textContent).toContain('°C')
    expect(container.querySelector('.hoverdot').style.opacity).toBe('1')

    act(() => { fireEvent.touchEnd(svg) })
    expect(container.querySelector('.tip').style.opacity).toBe('0')
    expect(container.querySelector('.hoverdot').style.opacity).toBe('0')
  })

  test('tooltip mostra "· agora" no índice 0', () => {
    const { container } = render(<HourlyChart hourly={makeHourly()} nowIndex={0} />)
    const svg = container.querySelector('#chartSvg')
    sizeSvg(svg)
    fireEvent.mouseMove(svg, { clientX: 44, clientY: 100 })
    expect(container.querySelector('.tip').textContent).toContain('14h')
    expect(container.querySelector('.tip').textContent).toContain('agora')
  })

  test('remontagem com novos dados reinicia a animação de entrada (classe de presença re-aparece)', () => {
    const { rerender } = render(<HourlyChart key="a" hourly={makeHourly([0, 0, 0, 0])} />)
    const section = getChart()
    const pts = () => Array.from(section.querySelectorAll('.pt'))
    const obs = window.IntersectionObserver.instances.find(o => o.elements.includes(section))

    // primeiro reveal -> pontos ganham .show
    act(() => { obs.intersect(section) })
    expect(pts().every(p => p.classList.contains('show'))).toBe(true)
    expect(Array.from(section.querySelectorAll('.area-path'))[0].classList.contains('show')).toBe(true)

    // remontagem (nova key) -> animação reinicia; .show some
    rerender(<HourlyChart key="b" hourly={makeHourly([5, 5, 5, 5])} />)
    const section2 = getChart()
    const pts2 = () => Array.from(section2.querySelectorAll('.pt'))
    expect(pts2().every(p => !p.classList.contains('show'))).toBe(true)

    // nova revela -> .show reaparece
    const obs2 = window.IntersectionObserver.instances.find(o => o.elements.includes(section2))
    act(() => { obs2.intersect(section2) })
    expect(pts2().every(p => p.classList.contains('show'))).toBe(true)
  })

  test('reduced motion: sem dash na linha, tudo visível', () => {
    const originalMatchMedia = window.matchMedia
    window.matchMedia = query => ({
      matches: query.includes('reduced-motion'),
      media: query,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {}
    })

    const lineStub = vi.spyOn(window.SVGElement.prototype, 'getTotalLength').mockReturnValue(5000)

    try {
      const { container } = render(<HourlyChart hourly={makeHourly()} nowIndex={0} />)
      const section = getChart()
      const line = container.querySelector('#linePath')
      const pts = Array.from(section.querySelectorAll('.pt'))

      reveal(section)

      expect(line.style.strokeDasharray).toBe('')
      expect(pts.every(p => p.classList.contains('show'))).toBe(true)
      expect(Array.from(section.querySelectorAll('.rain-bar')).every(r => r.classList.contains('show'))).toBe(true)
    } finally {
      lineStub.mockRestore()
      window.matchMedia = originalMatchMedia
    }
  })

  test('sem reduced motion aplica o dash na linha (animação de traçado)', () => {
    const lineStub = vi.spyOn(window.SVGElement.prototype, 'getTotalLength').mockReturnValue(5000)
    try {
      const { container } = render(<HourlyChart hourly={makeHourly()} nowIndex={0} />)
      const line = container.querySelector('#linePath')
      reveal(getChart())
      expect(line.style.strokeDasharray).toBe('5000')
      expect(line.style.strokeDashoffset).toBe('5000')
    } finally {
      lineStub.mockRestore()
    }
  })
})
