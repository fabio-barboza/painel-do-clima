import React from 'react'
import { describe, test, expect, afterEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import StatsGrid from '../components/StatsGrid.jsx'

function makeWeather(overrides = {}) {
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
      relative_humidity_2m: 62,
      apparent_temperature: 20,
      precipitation: 0,
      weather_code: 0,
      wind_speed_10m: 14,
      wind_direction_10m: 330,
      uv_index: 6,
    },
    hourly: { time: [], temperature_2m: [], precipitation: [], weather_code: [] },
    daily: { time: [], temperature_2m_max: [], temperature_2m_min: [], precipitation_probability_max: [], precipitation_sum: [], weather_code: [] },
    ...overrides,
  }
}

function bars() {
  return Array.from(document.querySelectorAll('.card.stat .bar i'))
}

function statIco(index) {
  return document.querySelectorAll('.card.stat .stat-ico')[index]
}

function statColor(index) {
  return getComputedStyle(statIco(index)).color
}

function iconName(span) {
  return span.querySelector('svg use').getAttribute('href')
}

function statValText(index) {
  return document.querySelectorAll('.card.stat .stat-val')[index].textContent
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('StatsGrid — unidade (estrutura e escalas)', () => {
  test('renderiza 4 cards com os rótulos corretos', () => {
    render(<StatsGrid data={makeWeather()} />)

    expect(document.querySelectorAll('.card.stat')).toHaveLength(4)
    expect(Array.from(document.querySelectorAll('.stat-label')).map((el) => el.textContent)).toEqual([
      'Sensação térmica',
      'Umidade',
      'Vento',
      'Índice UV',
    ])
  })

  test('--w correto por escala por card', () => {
    render(<StatsGrid data={makeWeather()} />)

    const [wFeels, wHum, wWind, wUv] = bars().map((el) => el.style.getPropertyValue('--w'))

    expect(wHum).toBe('62%')
    expect(wWind).toBe('35%')
    expect(wUv).toBe('50%')
    // sensação: escala −10…40 → (20−(−10))/(40−(−10)) = 60%
    expect(wFeels).toBe('60%')
    expect([wFeels, wHum, wWind, wUv].every((v) => {
      const n = Number(v.replace('%', ''))
      return n >= 4 && n <= 100
    })).toBe(true)
  })

  test('piso de 4% para valor zero (umidade, vento, UV)', () => {
    render(<StatsGrid data={makeWeather({ current: { ...makeWeather().current, relative_humidity_2m: 0, wind_speed_10m: 0, uv_index: 0 } })} />)

    const [, wHum, wWind, wUv] = bars().map((el) => el.style.getPropertyValue('--w'))

    expect(wHum).toBe('4%')
    expect(wWind).toBe('4%')
    expect(wUv).toBe('4%')
  })

  test('ícones e cores por posição', () => {
    render(<StatsGrid data={makeWeather()} />)

    expect(statColor(0)).toBe('rgb(255, 159, 122)')
    expect(iconName(statIco(0))).toBe('#i-thermo')

    expect(statColor(1)).toBe('rgb(124, 196, 255)')
    expect(iconName(statIco(1))).toBe('#i-drop')

    expect(statColor(2)).toBe('rgb(155, 232, 201)')
    expect(iconName(statIco(2))).toBe('#i-wind')

    expect(statColor(3)).toBe('rgb(255, 215, 106)')
    expect(iconName(statIco(3))).toBe('#i-uv')
  })

  test('estrutura idêntica ao protótipo: .stat-top / .stat-ico / .stat-label / .stat-val / .bar > i', () => {
    render(<StatsGrid data={makeWeather()} />)

    const card = document.querySelector('.card.stat')
    expect(card.querySelector('.stat-top')).toBeTruthy()
    expect(card.querySelector('.stat-top .stat-ico')).toBeTruthy()
    expect(card.querySelector('.stat-top .stat-label')).toBeTruthy()
    expect(card.querySelector('.stat-val small')).toBeTruthy()
    expect(card.querySelector('.bar i')).toBeTruthy()
    expect(card.getAttribute('style')).toBeNull()
  })
})

describe('StatsGrid — integração (WeatherResponse completo)', () => {
  test('vento exibe cardinal pt-BR (330° → NNO) e UV exibe rótulo (6 → Alto)', () => {
    render(<StatsGrid data={makeWeather()} />)

    expect(statValText(2)).toContain('14')
    expect(statValText(2)).toContain('km/h · NNO')
    expect(statValText(3)).toContain('6')
    expect(statValText(3)).toContain('· Alto')
  })

  test('uv_index nulo → valor 0 e rótulo "Baixo", sem quebra', () => {
    render(<StatsGrid data={makeWeather({ current: { ...makeWeather().current, uv_index: null } })} />)

    expect(statValText(3)).toContain('0')
    expect(statValText(3)).toContain('· Baixo')
    expect(bars()[3].style.getPropertyValue('--w')).toBe('4%')
  })

  test('valores extremos (umidade 100, vento 0, UV alto) não quebram layout nem barra', () => {
    render(
      <StatsGrid data={makeWeather({
        current: { ...makeWeather().current, relative_humidity_2m: 100, wind_speed_10m: 0, uv_index: 12 },
      })} />
    )

    expect(document.querySelectorAll('.card.stat')).toHaveLength(4)
    const [, wHum, wWind, wUv] = bars().map((el) => el.style.getPropertyValue('--w'))

    expect(wHum).toBe('100%')
    expect(wWind).toBe('4%')
    expect(wUv).toBe('100%')
  })

  test('apparent_temperature nula -> dash sem NaN e barra com piso', () => {
    render(
      <StatsGrid data={makeWeather({ current: { ...makeWeather().current, apparent_temperature: null } })} />
    )

    expect(statValText(0)).toContain('–')
    expect(statValText(0)).not.toContain('NaN')
    expect(bars()[0].style.getPropertyValue('--w')).toBe('4%')
  })
})
