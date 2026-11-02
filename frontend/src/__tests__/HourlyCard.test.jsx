import React from 'react'
import { render } from '@testing-library/react'
import HourlyCard from '../components/HourlyCard.jsx'
import { WEATHER_FIXTURE } from './fixtures/weather.js'

describe('HourlyCard', () => {
  beforeEach(() => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: false,
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
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('monta o cartão com cabeçalho, legendas de temperatura e precipitação e dica de interação', () => {
    const { container } = render(<HourlyCard weather={WEATHER_FIXTURE} />)

    const card = container.querySelector('#chartCard')
    expect(card).toHaveClass('card', 'reveal')
    expect(card).toHaveStyle({ '--d': '.16s' })
    expect(card.querySelector('h2')).toHaveTextContent('Previsão por hora')
    expect(card.querySelector('.chart-legend')).toHaveTextContent('Temperatura (°C)')
    expect(card.querySelector('.chart-legend .dotline.rain')).toBeInTheDocument()
    expect(card.querySelector('.chart-legend')).toHaveTextContent('Precipitação (mm)')
    expect(card.querySelector('.chart-hint')).toBeInTheDocument()
  })

  test('renderiza o gráfico dentro de #chartWrap com as 24 horas do dia atual', () => {
    const { container } = render(<HourlyCard weather={WEATHER_FIXTURE} />)

    expect(container.querySelector('#chartWrap svg#chartSvg')).toBeInTheDocument()
    expect(container.querySelectorAll('#chartWrap .pt')).toHaveLength(24)
  })
})
