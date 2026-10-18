import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import HourlyChart from '../components/HourlyChart.jsx'
import { deriveHourly24 } from '../utils/weatherCode.js'

class FakeResizeObserver {
  constructor(callback) {
    this.callback = callback
  }

  observe(element) {
    this.callback([{ target: element, contentRect: { width: 800, height: 280 } }], this)
  }

  unobserve() {}

  disconnect() {}
}

function isoAt(index) {
  const total = 12 + index
  const day = total < 24 ? 17 : 18
  const hour = total % 24
  return `2026-10-${day}T${String(hour).padStart(2, '0')}:00`
}

function buildForecast() {
  const time = Array.from({ length: 24 }, (_, index) => isoAt(index))
  return {
    current: {
      time: time[0],
      temperature_2m: 10,
      relative_humidity_2m: 72,
      precipitation: 0,
      weather_code: 2,
      wind_speed_10m: 11.4,
    },
    hourly: {
      time,
      temperature_2m: Array.from({ length: 24 }, (_, index) => 10 + index),
      precipitation: Array.from({ length: 24 }, (_, index) => index + 0.5),
    },
  }
}

function renderChart() {
  const data = deriveHourly24(buildForecast())
  const result = render(<HourlyChart data={data} />)
  return { ...result, data }
}

describe('deriveHourly24', () => {
  it('deriva 24 pontos com hora, temperatura e precipitação', () => {
    const data = deriveHourly24(buildForecast())
    expect(data).toHaveLength(24)
    expect(data[0]).toEqual({ hour: '12:00', temperature: 10, precipitation: 0.5 })
    expect(data[12]).toEqual({ hour: '00:00', temperature: 22, precipitation: 12.5 })
    expect(data[23]).toEqual({ hour: '11:00', temperature: 33, precipitation: 23.5 })
  })

  it('retorna lista vazia quando não há dados hourly', () => {
    expect(deriveHourly24({})).toEqual([])
    expect(deriveHourly24(null)).toEqual([])
    expect(deriveHourly24({ hourly: {} })).toEqual([])
  })
})

describe('HourlyChart', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', FakeResizeObserver)
    vi.stubGlobal('requestAnimationFrame', (callback) => {
      callback(0)
      return 0
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renderiza 24 pontos: 24 barras de precipitação e 24 pontos da linha de temperatura', () => {
    const { container } = renderChart()
    expect(container.querySelectorAll('.recharts-bar-rectangle path.recharts-rectangle')).toHaveLength(24)
    expect(container.querySelectorAll('.recharts-line-dot')).toHaveLength(24)
  })

  it('exibe eixos duplos com unidades °C à esquerda e mm à direita', () => {
    renderChart()
    expect(screen.getAllByText(/°C/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/mm/).length).toBeGreaterThan(0)
  })

  it('tooltip interativo exibe hora, temperatura e precipitação do ponto inspecionado', async () => {
    const { container } = renderChart()
    const bars = container.querySelectorAll('.recharts-bar-rectangle path.recharts-rectangle')
    const target = bars[6]
    const clientX = Number(target.getAttribute('x')) + Number(target.getAttribute('width')) / 2
    const clientY = Number(target.getAttribute('y')) + 4
    await act(async () => {
      fireEvent.mouseMove(container.querySelector('svg.recharts-surface'), { clientX, clientY })
    })

    const tooltip = container.querySelector('.hourly-chart-tooltip')
    expect(tooltip).not.toBeNull()
    expect(tooltip).toHaveTextContent('18:00')
    expect(tooltip).toHaveTextContent('Temperatura')
    expect(tooltip).toHaveTextContent('16,0 °C')
    expect(tooltip).toHaveTextContent('Precipitação')
    expect(tooltip).toHaveTextContent('6,5 mm')
  })

  it('tooltip some ao sair do gráfico', async () => {
    const { container } = renderChart()
    const bars = container.querySelectorAll('.recharts-bar-rectangle path.recharts-rectangle')
    const target = bars[6]
    const clientX = Number(target.getAttribute('x')) + Number(target.getAttribute('width')) / 2
    const clientY = Number(target.getAttribute('y')) + 4
    await act(async () => {
      fireEvent.mouseMove(container.querySelector('svg.recharts-surface'), { clientX, clientY })
    })
    expect(container.querySelector('.hourly-chart-tooltip')).not.toBeNull()
    await act(async () => {
      fireEvent.mouseLeave(container.querySelector('svg.recharts-surface'))
    })
    expect(container.querySelector('.hourly-chart-tooltip')).toBeNull()
  })

  it('oferece alternativa textual no HTML com os dados das 24 horas', () => {
    renderChart()
    const caption = screen.getByRole('caption', { name: /próximas 24 horas/i })
    expect(caption).toBeInTheDocument()
    expect(screen.getByRole('table')).toHaveClass('visually-hidden')
    expect(screen.getAllByRole('row')).toHaveLength(25)
    expect(screen.getByRole('cell', { name: '16,0 °C' })).toBeInTheDocument()
  })

  it('é responsivo: sem largura fixa no container do gráfico', () => {
    const { container } = renderChart()
    const responsive = container.querySelector('.recharts-responsive-container')
    expect(responsive).not.toBeNull()
    expect(responsive.style.width).toBe('100%')
    expect(responsive.style.height).toBe('280px')
    expect(responsive.style.minWidth).not.toMatch(/px/)
  })
})
