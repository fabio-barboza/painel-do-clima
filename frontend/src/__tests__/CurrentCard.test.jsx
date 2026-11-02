import React from 'react'
import { render } from '@testing-library/react'
import CurrentCard from '../components/CurrentCard.jsx'
import { WEATHER_FIXTURE } from './fixtures/weather.js'

const LOCATION_LABEL = 'Curitiba, Paraná'
const MISSING = '–'

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

function buildWeather(currentOverrides = {}, dailyOverrides = {}) {
  const weather = structuredClone(WEATHER_FIXTURE)
  weather.current = { ...weather.current, ...currentOverrides }
  weather.daily = { ...weather.daily, ...dailyOverrides }
  return weather
}

function renderCard(weather, locationLabel = LOCATION_LABEL) {
  return render(<CurrentCard weather={weather} locationLabel={locationLabel} />)
}

describe('CurrentCard', () => {
  beforeEach(() => {
    mockReducedMotion()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('mantém a estrutura e as classes de section.current', () => {
    const { container } = renderCard(buildWeather())

    const section = container.querySelector('section.card.current.reveal')
    expect(section).toHaveAttribute('aria-label', 'Temperatura atual')
    expect(section.style.getPropertyValue('--d')).toBe('.08s')
    expect(section.querySelector('.current-top .loc #locName')).toBeInTheDocument()
    expect(section.querySelector('.current-top .updated .pulse-dot')).toBeInTheDocument()
    expect(section.querySelector('.current-foot')).toBeInTheDocument()
  })

  test('mostra local, temperatura e condição vindos da resposta', () => {
    const { container } = renderCard(buildWeather())

    expect(container.querySelector('#locName').textContent).toBe(LOCATION_LABEL)
    expect(container.querySelector('#tempVal').textContent).toBe('26')
    expect(container.querySelector('.temp').textContent).toBe('26°')
    expect(container.querySelector('.condition').textContent).toBe('Parcialmente nublado')
  })

  test('preenche máxima, mínima, sensação e precipitação com dados reais', () => {
    const { container } = renderCard(buildWeather({ precipitation: 0 }))

    expect(container.querySelector('#maxT').textContent).toBe('26°')
    expect(container.querySelector('#minT').textContent).toBe('12°')
    expect(container.querySelector('#feels').textContent).toBe('28°')
    expect(container.querySelector('.current-foot .chip:last-child').textContent).toBe(' Precipitação 0,0 mm')
  })

  test('a precipitação vem da resposta, não do valor fixo do protótipo', () => {
    const { container } = renderCard(buildWeather({ precipitation: 1.26 }))

    expect(container.querySelector('.current-foot .chip:last-child b').textContent).toBe('1,3 mm')
  })

  test('escolhe o ícone e o rótulo pelo código meteorológico', () => {
    const { container } = renderCard(buildWeather({ weather_code: 95 }))

    expect(container.querySelector('.condition').textContent).toBe('Trovoada')
    expect(container.querySelector('.bi-cloud use')).toHaveAttribute('href', '#i-storm')
    expect(container.querySelector('.bi-sun')).not.toBeInTheDocument()
  })

  test('exibe temperatura negativa contada até o valor real', () => {
    const { container } = renderCard(buildWeather({ temperature_2m: -3.6 }))

    expect(container.querySelector('#tempVal').textContent).toBe('-4')
    expect(container.querySelector('.temp').textContent).toBe('-4°')
  })

  test('mostra o placeholder para cada campo nulo, sem sinal de grau', () => {
    const { container } = renderCard(
      buildWeather(
        { temperature_2m: null, apparent_temperature: null, precipitation: null },
        { temperature_2m_max: [null], temperature_2m_min: [null] },
      ),
    )

    expect(container.querySelector('#tempVal').textContent).toBe(MISSING)
    expect(container.querySelector('.temp').textContent).toBe(MISSING)
    expect(container.querySelector('#maxT').textContent).toBe(MISSING)
    expect(container.querySelector('#minT').textContent).toBe(MISSING)
    expect(container.querySelector('#feels').textContent).toBe(MISSING)
    expect(container.querySelector('.current-foot .chip:last-child b').textContent).toBe(MISSING)
  })
})
