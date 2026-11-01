import React from 'react'
import { describe, test, expect, afterEach, vi } from 'vitest'
import { act } from 'react'
import { render, screen } from '@testing-library/react'
import CurrentConditions from '../components/CurrentConditions.jsx'
import WeatherIconBig from '../components/WeatherIconBig.jsx'

function makeWeather(overrides = {}) {
  const seq = (n) => Array.from({ length: n }, (_, i) => i)
  return {
    city: {
      name: 'Curitiba',
      region: 'Paraná',
      display: 'Curitiba, Paraná',
      latitude: -25.43,
      longitude: -49.27,
    },
    timezone: 'America/Sao_Paulo',
    current: {
      time: '2026-10-27T19:15',
      temperature_2m: 19.7,
      relative_humidity_2m: 71,
      apparent_temperature: 21.4,
      precipitation: 0,
      weather_code: 0,
      wind_speed_10m: 12,
      wind_direction_10m: 180,
      uv_index: 5,
    },
    hourly: {
      time: seq(24),
      temperature_2m: seq(24),
      precipitation: seq(24),
      weather_code: seq(24),
    },
    daily: {
      time: seq(7),
      temperature_2m_max: [28.3, 27, 26, 25, 24, 23, 22],
      temperature_2m_min: [12.6, 11, 10, 9, 8, 7, 6],
      precipitation_probability_max: [10, 20, 30, 40, 50, 60, 70],
      precipitation_sum: [0, 0, 2, 4, 6, 1, 0],
      weather_code: [0, 1, 2, 3, 61, 63, 80],
    },
    ...overrides,
  }
}

function renderWith(data) {
  return render(<CurrentConditions data={data} />)
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.clearAllTimers()
  vi.useRealTimers()
})

describe('CurrentConditions — unidade', () => {
  test('exibe cidade via city.display, condição via mapa WMO e os 3 chips', () => {
    renderWith(makeWeather())

    expect(screen.getByText('Curitiba, Paraná')).toBeInTheDocument()
    expect(screen.getByText('Céu limpo')).toBeInTheDocument()
    expect(document.querySelector('.chip.hot b')).toHaveTextContent('28')
    expect(document.querySelector('.chip.cold b')).toHaveTextContent('13')
    expect(document.querySelector('.chip.plain b')).toHaveTextContent('21')
  })

  test('count-up termina exatamente no Math.round da temperatura, com "°" fixo', () => {
    vi.useFakeTimers()
    renderWith(makeWeather({ current: { ...makeWeather().current, temperature_2m: 19.7 } }))

    // antes do delay de 450 ms, ainda é 0
    expect(document.querySelector('.temp')).toHaveTextContent('0°')

    act(() => {
      vi.advanceTimersByTime(450 + 1400)
    })

    expect(document.querySelector('.temp')).toHaveTextContent('20°')
  })

  test('placeholders "–" quando não há dados para máx/mín/sensação', () => {
    const semDados = makeWeather({
      daily: null,
      current: { ...makeWeather().current, apparent_temperature: null },
    })

    renderWith(semDados)

    expect(document.querySelector('.chip.hot b')).toHaveTextContent('–')
    expect(document.querySelector('.chip.cold b')).toHaveTextContent('–')
    expect(document.querySelector('.chip.plain b')).toHaveTextContent('–')
  })

  test('city.name nulo → "Sua localização" (fluxo de geolocalização)', () => {
    const geo = makeWeather({
      city: { name: null, region: null, display: null, latitude: -25.43, longitude: -49.27 },
    })

    renderWith(geo)

    expect(screen.getByText('Sua localização')).toBeInTheDocument()
  })
})

describe('CurrentConditions — integração (slice WeatherResponse completo)', () => {
  const data = makeWeather()

  test('cidade, "Atualizado HH:MM" a partir de current.time e chips de daily[0]/apparent', () => {
    renderWith(data)

    expect(screen.getByText('Curitiba, Paraná')).toBeInTheDocument()
    expect(screen.getByText('Atualizado 19:15')).toBeInTheDocument()
    expect(document.querySelector('.chip.hot b')).toHaveTextContent('28')
    expect(document.querySelector('.chip.cold b')).toHaveTextContent('13')
    expect(document.querySelector('.chip.plain b')).toHaveTextContent('21')
  })

  test('city.name nulo → "Sua localização" com dados reais do backend', () => {
    const geo = makeWeather({
      city: { name: null, region: null, display: null, latitude: -25.43, longitude: -49.27 },
      current: { ...makeWeather().current, temperature_2m: 17.2, apparent_temperature: 16 },
    })

    renderWith(geo)

    expect(screen.getByText('Sua localização')).toBeInTheDocument()
    expect(screen.getByText('Atualizado 19:15')).toBeInTheDocument()
    expect(document.querySelector('.chip.plain b')).toHaveTextContent('16')
  })
})

describe('WeatherIconBig — variante por weather_code', () => {
  function useHref(container) {
    return container.querySelector('svg use').getAttribute('href')
  }

  test('código 0 (sol) → composição .bi-sun com .rotor, sem nuvem', () => {
    const { container } = render(<WeatherIconBig code={0} />)
    expect(container.querySelector('.bi-sun')).toBeTruthy()
    expect(container.querySelector('.bi-sun .rotor')).toBeTruthy()
    expect(container.querySelector('.bi-cloud')).toBeNull()
  })

  test('código 2 (sol com nuvem) → .bi-sun + .bi-cloud', () => {
    const { container } = render(<WeatherIconBig code={2} />)
    expect(container.querySelector('.bi-sun')).toBeTruthy()
    expect(container.querySelector('.bi-cloud')).toBeTruthy()
  })

  test('código 3 (nublado) → ícone .bi-big com #i-cloud', () => {
    const { container } = render(<WeatherIconBig code={3} />)
    expect(container.querySelector('.bi-cloud')).toBeNull()
    expect(container.querySelector('.bi-sun')).toBeNull()
    expect(useHref(container)).toBe('#i-cloud')
  })

  test('código 61 (chuva) → ícone .bi-big com #i-rain', () => {
    const { container } = render(<WeatherIconBig code={61} />)
    expect(useHref(container)).toBe('#i-rain')
  })

  test('código 95 (trovoada) → ícone .bi-big com #i-storm', () => {
    const { container } = render(<WeatherIconBig code={95} />)
    expect(useHref(container)).toBe('#i-storm')
  })

  test('código desconhecido → fallback cloud', () => {
    const { container } = render(<WeatherIconBig code={999} />)
    expect(useHref(container)).toBe('#i-cloud')
  })
})
