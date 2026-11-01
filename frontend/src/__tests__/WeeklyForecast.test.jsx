import React from 'react'
import { describe, test, expect, afterEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import WeeklyForecast from '../components/WeeklyForecast.jsx'
import { formatDayLabel, formatShortDate } from '../lib/format.js'

const DATES = [
  '2026-08-16T00:00',
  '2026-08-17T00:00',
  '2026-08-18T00:00',
  '2026-08-19T00:00',
  '2026-08-20T00:00',
  '2026-08-21T00:00',
  '2026-08-22T00:00',
]

const WEEKLY = {
  time: DATES,
  temperature_2m_max: [25, 23, 21, 19, 22, 24, 26],
  temperature_2m_min: [14, 12, 11, 10, 13, 15, 16],
  precipitation_probability_max: [30, null, 75.4, 0, 10, null, 5],
  weather_code: [0, 2, 55, 95, 3, 1, 61],
}

function days() {
  return Array.from(document.querySelectorAll('.weekly-grid > .day'))
}

function icoColor(dayEl) {
  return dayEl.querySelector('.d-ico').getAttribute('style')
}

function icoHref(dayEl) {
  return dayEl.querySelector('.d-ico use').getAttribute('href')
}

function maxText(dayEl) {
  return dayEl.querySelector('.d-temps b').textContent
}

function minText(dayEl) {
  return dayEl.querySelector('.d-temps span').textContent
}

function rainText(dayEl) {
  return dayEl.querySelector('.d-rain').textContent
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('WeeklyForecast — unidade (estrutura)', () => {
  test('renderiza exactly 7 cards derivados de daily', () => {
    render(<WeeklyForecast daily={WEEKLY} />)
    expect(days()).toHaveLength(7)
  })

  test('estrutura exata de cada .day (d-name/d-date/d-ico/d-temps/d-rain)', () => {
    render(<WeeklyForecast daily={WEEKLY} />)
    const [first] = days()
    expect(first.querySelector('.d-name')).toBeTruthy()
    expect(first.querySelector('.d-date')).toBeTruthy()
    expect(first.querySelector('.d-ico')).toBeTruthy()
    expect(first.querySelector('.d-temps b')).toBeTruthy()
    expect(first.querySelector('.d-temps span')).toBeTruthy()
    expect(first.querySelector('.d-rain svg use')).toHaveAttribute('href', '#i-drop')
  })

  test('primeiro dia com rótulo "Hoje" e classe today, somente no índice 0', () => {
    render(<WeeklyForecast daily={WEEKLY} />)

    expect(days()[0].querySelector('.d-name').textContent).toBe('Hoje')
    expect(days()[0].querySelector('.d-name')).toHaveClass('today')
    expect(days()[1].querySelector('.d-name')).not.toHaveClass('today')
    expect(days()[6].querySelector('.d-name')).not.toHaveClass('today')
    // classe `today` vai somente em `.d-name`, nunca no `.day` (protótipo linhas 674–675)
    expect(days().every((el) => !el.classList.contains('today'))).toBe(true)
  })

  test('data curta no formato pt-BR "16 ago" (sem "de")', () => {
    render(<WeeklyForecast daily={WEEKLY} />)

    expect(days()[0].querySelector('.d-date').textContent).toBe('16 ago')
    expect(days()[1].querySelector('.d-date').textContent).toBe('17 ago')
    expect(days()[6].querySelector('.d-date').textContent).toBe('22 ago')
  })

  test('chuva: inteiro + "%" e "–" quando null', () => {
    render(<WeeklyForecast daily={WEEKLY} />)

    expect(rainText(days()[0])).toContain('30%')
    expect(rainText(days()[2])).toContain('75%') // 75.4 -> round
    expect(rainText(days()[3])).toContain('0%')
    expect(rainText(days()[1])).toContain('–')
    expect(rainText(days()[5])).toContain('–')
  })

  test('ícone e cor por variante do mapa WMO', () => {
    render(<WeeklyForecast daily={WEEKLY} />)

    // índice 0: code 0 (sol) -> i-sun, #ffd76a
    expect(icoHref(days()[0])).toBe('#i-sun')
    expect(icoColor(days()[0])).toContain('rgb(255, 215, 106)')

    // índice 1: code 2 (parcialmente nublado) -> i-cloud-sun, #ffd76a
    expect(icoHref(days()[1])).toBe('#i-cloud-sun')
    expect(icoColor(days()[1])).toContain('rgb(255, 215, 106)')

    // índice 2: code 55 (chuva) -> i-rain, #7cc4ff
    expect(icoHref(days()[2])).toBe('#i-rain')
    expect(icoColor(days()[2])).toContain('rgb(124, 196, 255)')

    // índice 3: code 95 (tempestade) -> i-storm, #c9b8ff
    expect(icoHref(days()[3])).toBe('#i-storm')
    expect(icoColor(days()[3])).toContain('rgb(201, 184, 255)')

    // índice 4: code 3 (nublado) -> i-cloud, #c9d6f2
    expect(icoHref(days()[4])).toBe('#i-cloud')
    expect(icoColor(days()[4])).toContain('rgb(201, 214, 242)')
  })
})

describe('WeeklyForecast — integração (daily sintético de 7 dias)', () => {
  test('rótulos de dia e datas coerentes (pt-BR), ordens preservadas', () => {
    render(<WeeklyForecast daily={WEEKLY} />)

    expect(days()[0].querySelector('.d-name').textContent).toBe(formatDayLabel(DATES[0], 0))
    expect(days()[0].querySelector('.d-date').textContent).toBe(formatShortDate(DATES[0]))

    for (let i = 1; i < 7; i += 1) {
      const label = formatDayLabel(DATES[i], i)
      expect(days()[i].querySelector('.d-name').textContent).toBe(label)
      expect(days()[i].querySelector('.d-name')).not.toHaveClass('today')
      expect(label).not.toContain('.')
      expect(days()[i].querySelector('.d-date').textContent).toBe(formatShortDate(DATES[i]))
    }
  })

  test('mín/máx arredondadas', () => {
    render(
      <WeeklyForecast
        daily={{
          time: ['2026-11-02T00:00', '2026-11-03T00:00'],
          temperature_2m_max: [25.6, 18.4],
          temperature_2m_min: [14.4, 6.5],
          precipitation_probability_max: [0, null],
          weather_code: [0, 3],
        }}
      />
    )

    expect(maxText(days()[0])).toBe('26°')
    expect(minText(days()[0])).toBe('14°')
    expect(maxText(days()[1])).toBe('18°')
    expect(minText(days()[1])).toBe('7°')
  })

  test('todos os grupos WMO de ícone/cor presentes (sol, parcial, nuvem, chuva, tempestade)', () => {
    render(
      <WeeklyForecast
        daily={{
          time: DATES.slice(0, 5),
          temperature_2m_max: [20, 20, 20, 20, 20],
          temperature_2m_min: [10, 10, 10, 10, 10],
          precipitation_probability_max: [null, null, null, null, null],
          weather_code: [1, 3, 45, 65, 99],
        }}
      />
    )

    expect(icoHref(days()[0])).toBe('#i-sun')
    expect(icoHref(days()[1])).toBe('#i-cloud')
    expect(icoHref(days()[2])).toBe('#i-cloud')
    expect(icoHref(days()[3])).toBe('#i-rain')
    expect(icoHref(days()[4])).toBe('#i-storm')
  })

  test('ordenação "hoje primeiro" preservada (índice 0 = primeiro do array)', () => {
    render(<WeeklyForecast daily={WEEKLY} />)

    expect(days()[0].querySelector('.d-date').textContent).toBe('16 ago')
    expect(days()[0].querySelector('.d-name')).toHaveClass('today')
    expect(days()[6].querySelector('.d-date').textContent).toBe('22 ago')
  })

  test('temperaturas negativas não quebram (mín/min/–, sem NaN)', () => {
    render(
      <WeeklyForecast
        daily={{
          time: ['2026-12-01T00:00', '2026-12-02T00:00'],
          temperature_2m_max: [-1.4, 3],
          temperature_2m_min: [-8.6, -2],
          precipitation_probability_max: [null, 20],
          weather_code: [71, 61],
        }}
      />
    )

    expect(maxText(days()[0])).toBe('-1°')
    expect(minText(days()[0])).toBe('-9°')
    expect(rainText(days()[0])).toContain('–')
    expect(days()[0].textContent).not.toContain('NaN')
  })
})
