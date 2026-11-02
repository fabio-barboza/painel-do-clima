import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import HourlyChart from '../components/HourlyChart.jsx'
import { selectTodayHours } from '../lib/format.js'
import { WEATHER_FIXTURE } from './fixtures/weather.js'

const FIXTURE_SERIES = selectTodayHours(WEATHER_FIXTURE.hourly, WEATHER_FIXTURE.current.time)
const CHART_WIDTH = 760
const CHART_HEIGHT = 300
const PLOT_LEFT = 44
const PLOT_RIGHT = 16
const PLOT_WIDTH = CHART_WIDTH - PLOT_LEFT - PLOT_RIGHT
const STEP = PLOT_WIDTH / (FIXTURE_SERIES.temps.length - 1)
const NOW_INDEX = 14
const NOW_CLIENT_X = PLOT_LEFT + NOW_INDEX * STEP
const EDGE_CLIENT_X = PLOT_LEFT
const TOOLTIP_EDGE = 56
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'
const LAYER_ORDER = [
  'grid-line',
  'axis-label',
  'precip-bar',
  'area-path',
  'line-path',
  'now-line',
  'now-ring',
  'now-dot',
  'pt',
  'guide',
  'hoverdot',
]

const CHART_RECT = {
  left: 0,
  top: 0,
  width: CHART_WIDTH,
  height: CHART_HEIGHT,
  right: CHART_WIDTH,
  bottom: CHART_HEIGHT,
  x: 0,
  y: 0,
  toJSON() {},
}

function stubFrames() {
  const queue = new Map()
  let nextId = 1
  vi.stubGlobal('requestAnimationFrame', (callback) => {
    const id = nextId
    nextId += 1
    queue.set(id, callback)
    return id
  })
  vi.stubGlobal('cancelAnimationFrame', (id) => {
    queue.delete(id)
  })
  return {
    flush() {
      const pending = [...queue.values()]
      queue.clear()
      pending.forEach((callback) => callback(0))
    },
    size: () => queue.size,
  }
}

function setReducedMotion(matches) {
  vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
    matches: query === REDUCED_QUERY ? matches : false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false
    },
  }))
}

function renderChart(overrides = {}) {
  return render(<HourlyChart {...FIXTURE_SERIES} revealed={false} {...overrides} />)
}

function readTip(container) {
  return container.querySelector('.tip')
}

function readSvg(container) {
  return container.querySelector('svg')
}

describe('HourlyChart', () => {
  beforeEach(() => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(CHART_RECT)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  test('desenha 24 pontos e identifica o SVG com viewBox e aria-label', () => {
    const { container } = renderChart()

    expect(container.querySelectorAll('.pt')).toHaveLength(24)
    expect(readSvg(container)).toHaveAttribute('viewBox', '0 0 760 300')
    expect(readSvg(container)).toHaveAttribute('aria-label', 'Gráfico de temperatura por hora')
  })

  test('define os gradientes lineGrad e areaGrad dentro de defs', () => {
    const { container } = renderChart()

    expect(container.querySelector('defs #lineGrad')).toBeInTheDocument()
    expect(container.querySelector('defs #areaGrad')).toBeInTheDocument()
  })

  test('empilha as camadas na ordem da especificação, com precipitação', () => {
    const precip = FIXTURE_SERIES.precip.map((_, index) => (index % 2 === 0 ? 1 : 0))
    const { container } = renderChart({ precip })

    const classes = Array.from(readSvg(container).children).map((element) => element.getAttribute('class'))
    const sequence = [...new Set(classes.filter(Boolean).map((name) => name.split(' ')[0]))]

    expect(sequence).toEqual(LAYER_ORDER)
  })

  test('mouse mostra guia, ponto e tooltip com hora, temperatura, precipitação e "agora"', () => {
    const { container } = renderChart()

    fireEvent.mouseMove(readSvg(container), { clientX: NOW_CLIENT_X })

    expect(readTip(container)).toHaveTextContent('14h · 26°C · 0,0 mm · agora')
    expect(readTip(container)).toHaveStyle({ opacity: '1' })
    expect(container.querySelector('.guide')).toHaveStyle({ opacity: '1' })
    expect(container.querySelector('.hoverdot')).toHaveStyle({ opacity: '1' })
  })

  test('mouse fora do horário atual mostra o tooltip sem "agora"', () => {
    const { container } = renderChart()

    fireEvent.mouseMove(readSvg(container), { clientX: PLOT_LEFT + 3 * STEP })

    expect(readTip(container)).toHaveTextContent('03h · 13°C · 0,0 mm')
    expect(readTip(container).textContent).not.toContain('agora')
  })

  test('sair do gráfico com o mouse esconde guia, ponto e tooltip', () => {
    const { container } = renderChart()

    fireEvent.mouseMove(readSvg(container), { clientX: NOW_CLIENT_X })
    fireEvent.mouseLeave(readSvg(container))

    expect(readTip(container)).toHaveStyle({ opacity: '0' })
    expect(container.querySelector('.guide')).toHaveStyle({ opacity: '0' })
    expect(container.querySelector('.hoverdot')).toHaveStyle({ opacity: '0' })
  })

  test('sair do gráfico mantém posição e texto do tooltip durante o fade', () => {
    const { container } = renderChart()

    fireEvent.mouseMove(readSvg(container), { clientX: NOW_CLIENT_X })
    const shownLeft = readTip(container).style.left
    const shownTop = readTip(container).style.top
    expect(shownLeft).toMatch(/px$/)
    expect(shownTop).toMatch(/px$/)

    fireEvent.mouseLeave(readSvg(container))

    expect(readTip(container)).toHaveStyle({ opacity: '0', left: shownLeft, top: shownTop })
    expect(readTip(container)).toHaveTextContent('14h · 26°C · 0,0 mm · agora')
  })

  test('toque mostra o tooltip e o fim do toque o esconde', () => {
    const { container } = renderChart()

    fireEvent.touchStart(readSvg(container), { touches: [{ clientX: NOW_CLIENT_X }] })
    expect(readTip(container)).toHaveTextContent('14h · 26°C · 0,0 mm · agora')

    fireEvent.touchMove(readSvg(container), { touches: [{ clientX: PLOT_LEFT + 2 * STEP }] })
    expect(readTip(container)).toHaveTextContent('02h · 13°C')

    fireEvent.touchEnd(readSvg(container))
    expect(readTip(container)).toHaveStyle({ opacity: '0' })
  })

  test('interação funciona com movimento reduzido, sem desativar o tooltip', () => {
    setReducedMotion(true)
    const { container } = renderChart()

    fireEvent.mouseMove(readSvg(container), { clientX: NOW_CLIENT_X })

    expect(readTip(container)).toHaveTextContent('14h · 26°C · 0,0 mm · agora')
  })

  test('tooltip na borda esquerda fica limitado a 56px do início do gráfico', () => {
    const { container } = renderChart()

    fireEvent.mouseMove(readSvg(container), { clientX: EDGE_CLIENT_X })

    expect(readTip(container)).toHaveStyle({ left: `${TOOLTIP_EDGE}px` })
  })

  test('toque perto da borda usa a largura medida do tooltip (180px gera limite de 90px)', () => {
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(180)
    const { container } = renderChart()

    fireEvent.touchStart(readSvg(container), { touches: [{ clientX: EDGE_CLIENT_X }] })

    expect(readTip(container)).toHaveStyle({ left: '90px' })
  })

  test('temperatura negativa, constante e precipitação zero renderizam sem NaN', () => {
    const negativeTemps = FIXTURE_SERIES.temps.map((value) => value - 30)
    const constantTemps = FIXTURE_SERIES.temps.map(() => 20)
    const zeroPrecip = FIXTURE_SERIES.precip.map(() => 0)

    const negative = renderChart({ temps: negativeTemps, precip: zeroPrecip })
    expect(negative.container.innerHTML).not.toContain('NaN')
    expect(negative.container.querySelectorAll('.precip-bar')).toHaveLength(0)
    negative.unmount()

    const constant = renderChart({ temps: constantTemps, precip: zeroPrecip })
    expect(constant.container.innerHTML).not.toContain('NaN')
    constant.unmount()
  })

  test('sem revelação, a linha não recebe traço nem a classe show', () => {
    const { container } = renderChart({ revealed: false })

    expect(container.querySelector('.area-path')).not.toHaveClass('show')
    expect(container.querySelector('.pt')).not.toHaveClass('show')
    expect(container.querySelector('.line-path').style.strokeDasharray).toBe('')
  })

  test('ao ser revelado, desenha a linha em dois quadros e depois mostra área, pontos e barras', () => {
    const frames = stubFrames()
    const { container } = renderChart({ revealed: true, precip: FIXTURE_SERIES.precip.map(() => 1) })
    const line = container.querySelector('.line-path')

    expect(line.style.strokeDasharray).toBe('1000')
    expect(line.style.strokeDashoffset).toBe('1000')
    expect(container.querySelector('.area-path')).not.toHaveClass('show')

    act(() => frames.flush())
    expect(line.style.transition).toBe('')
    expect(container.querySelector('.area-path')).not.toHaveClass('show')

    act(() => frames.flush())
    expect(line.style.transition).toContain('stroke-dashoffset 1.8s')
    expect(line.style.strokeDashoffset).toBe('0')
    expect(container.querySelector('.area-path')).toHaveClass('show')
    expect(container.querySelector('.pt')).toHaveClass('show')
    expect(container.querySelector('.precip-bar')).toHaveClass('show')
  })

  test('com movimento reduzido, mostra área e pontos sem traço da linha', () => {
    setReducedMotion(true)
    const frames = stubFrames()
    const { container } = renderChart({ revealed: true })

    act(() => frames.flush())

    expect(container.querySelector('.area-path')).toHaveClass('show')
    expect(container.querySelector('.pt')).toHaveClass('show')
    expect(container.querySelector('.line-path').style.strokeDasharray).toBe('')
  })

  test('cancela os quadros pendentes no cleanup', () => {
    const frames = stubFrames()
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame')
    const { unmount } = renderChart({ revealed: true })

    expect(frames.size()).toBe(1)
    unmount()

    expect(cancelSpy).toHaveBeenCalledTimes(1)
    expect(frames.size()).toBe(0)
  })
})
