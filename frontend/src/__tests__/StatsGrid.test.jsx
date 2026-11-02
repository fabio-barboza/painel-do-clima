import React from 'react'
import { render } from '@testing-library/react'
import StatsGrid from '../components/StatsGrid.jsx'
import { WEATHER_FIXTURE } from './fixtures/weather.js'

const MISSING = '–'
const FEELS_DELAY = '.24s'

function mockReducedMotion() {
  vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
    matches: true,
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

function buildCurrent(overrides = {}) {
  const weather = structuredClone(WEATHER_FIXTURE)
  return { ...weather.current, ...overrides }
}

function renderGrid(current) {
  return render(<StatsGrid current={current} />)
}

function statAt(container, position) {
  return container.querySelectorAll('.grid-stats > .card.stat')[position]
}

describe('StatsGrid', () => {
  beforeEach(() => {
    mockReducedMotion()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('renderiza 4 .card.stat como filhos diretos de .grid-stats, com o atraso .24s', () => {
    const { container } = renderGrid(buildCurrent())

    const grid = container.querySelector('section.grid-stats.reveal')
    expect(grid.style.getPropertyValue('--d')).toBe(FEELS_DELAY)
    expect(grid).toHaveAttribute('aria-label', 'Detalhes do clima')
    expect(grid.children).toHaveLength(4)
    expect([...grid.children].every((child) => child.matches('.card.stat'))).toBe(true)
  })

  test('começa sem .in e só revela a grade quando ela entra na tela', () => {
    const { container } = renderGrid(buildCurrent())

    expect(container.querySelector('section.grid-stats')).toHaveClass('reveal')
    expect(container.querySelector('section.grid-stats')).not.toHaveClass('in')
  })

  test('mostra sensação, umidade, vento e UV com a marcação da resposta', () => {
    const { container } = renderGrid(buildCurrent())

    expect(container.querySelector('#statFeels').innerHTML).toBe('28<small> °C</small>')
    expect(statAt(container, 1).querySelector('.stat-val').innerHTML).toBe('62<small> %</small>')
    expect(statAt(container, 2).querySelector('.stat-val').innerHTML).toBe('14<small> km/h · NNO</small>')
    expect(statAt(container, 3).querySelector('.stat-val').innerHTML).toBe('6 <small>· Alto</small>')
  })

  test('define as barras em escala real a partir dos valores da resposta', () => {
    const { container } = renderGrid(buildCurrent({ apparent_temperature: 20 }))

    expect(statAt(container, 0).querySelector('.bar i').style.getPropertyValue('--w')).toBe('55%')
    expect(statAt(container, 1).querySelector('.bar i').style.getPropertyValue('--w')).toBe('62%')
    expect(statAt(container, 2).querySelector('.bar i').style.getPropertyValue('--w')).toBe('40%')
    expect(statAt(container, 3).querySelector('.bar i').style.getPropertyValue('--w')).toBe('50%')
  })

  test('aplica .bar-uv à barra de UV com --f igual à fração do preenchimento', () => {
    const { container } = renderGrid(buildCurrent())

    const uvFill = statAt(container, 3).querySelector('.bar.bar-uv i')
    expect(uvFill.style.getPropertyValue('--f')).toBe('0.5')
    expect(statAt(container, 0).querySelector('.bar')).not.toHaveClass('bar-uv')
  })

  test('usa --f mínimo de 0.01 quando o UV é zero', () => {
    const { container } = renderGrid(buildCurrent({ uv_index: 0 }))

    const uvFill = statAt(container, 3).querySelector('.bar.bar-uv i')
    expect(uvFill.style.getPropertyValue('--w')).toBe('0%')
    expect(uvFill.style.getPropertyValue('--f')).toBe('0.01')
  })

  test('exibe – e barra vazia para valores nulos', () => {
    const { container } = renderGrid(
      buildCurrent({
        apparent_temperature: null,
        relative_humidity_2m: null,
        wind_speed_10m: null,
        uv_index: null,
      }),
    )

    expect(container.querySelector('#statFeels').textContent).toBe(MISSING)
    expect(statAt(container, 1).querySelector('.stat-val').textContent).toBe(MISSING)
    expect(statAt(container, 2).querySelector('.stat-val').textContent).toBe(MISSING)
    expect(statAt(container, 3).querySelector('.stat-val').textContent).toBe(MISSING)
    expect(container.querySelectorAll('.bar i')[0].style.getPropertyValue('--w')).toBe('0%')
  })
})
