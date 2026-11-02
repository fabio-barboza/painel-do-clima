import React from 'react'
import { render } from '@testing-library/react'
import WeeklyCard from '../components/WeeklyCard.jsx'
import { WEATHER_FIXTURE, WEEK } from './fixtures/weather.js'

const EXPECTED_NAMES = ['Hoje', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const EXPECTED_RANGES = [
  { left: '12%', width: '82%' },
  { left: '6%', width: '65%' },
  { left: '0%', width: '59%' },
  { left: '0%', width: '65%' },
  { left: '18%', width: '82%' },
  { left: '18%', width: '76%' },
  { left: '12%', width: '76%' },
]

function buildWeather(daily) {
  return { ...WEATHER_FIXTURE, daily: { ...WEATHER_FIXTURE.daily, ...daily } }
}

function renderWeekly(weather) {
  return render(<WeeklyCard weather={weather} />)
}

function readRangeStyles(container) {
  return Array.from(container.querySelectorAll('.day .d-range i')).map((bar) => ({
    left: bar.style.getPropertyValue('--l'),
    width: bar.style.getPropertyValue('--w'),
  }))
}

describe('WeeklyCard', () => {
  test('renderiza sete .day dentro de #weeklyGrid, começando em Hoje', () => {
    const { container } = renderWeekly(WEATHER_FIXTURE)

    const days = container.querySelectorAll('#weeklyGrid > .day')
    expect(days).toHaveLength(7)
    const names = Array.from(days, (day) => day.querySelector('.d-name').textContent)
    expect(names).toEqual(EXPECTED_NAMES)
    expect(days[0].querySelector('.d-name')).toHaveClass('today')
  })

  test('mostra máxima, mínima, probabilidade e volume de cada dia da resposta', () => {
    const { container } = renderWeekly(WEATHER_FIXTURE)

    const days = Array.from(container.querySelectorAll('.day'))
    days.forEach((day, index) => {
      const entry = WEEK[index]
      expect(day.querySelector('.d-temps b').textContent).toBe(`${entry.max}°`)
      expect(day.querySelector('.d-temps span').textContent).toBe(`${entry.min}°`)
      expect(day.querySelector('.d-rain').textContent.trim()).toBe(
        `${entry.rain}% · ${(entry.rain * 0.1).toFixed(1).replace('.', ',')} mm`,
      )
    })
  })

  test('calcula a faixa de cada dia em escala comum aos sete dias', () => {
    const { container } = renderWeekly(WEATHER_FIXTURE)

    expect(readRangeStyles(container)).toEqual(EXPECTED_RANGES)
  })

  test('usa 0% e 100% quando todas as mínimas e máximas são iguais', () => {
    const flat = Array.from({ length: 7 }, () => 15)
    const { container } = renderWeekly(buildWeather({
      temperature_2m_max: flat,
      temperature_2m_min: flat,
    }))

    readRangeStyles(container).forEach((range) => {
      expect(range).toEqual({ left: '0%', width: '100%' })
    })
  })

  test('mostra o placeholder em probabilidade nula sem quebrar os demais dias', () => {
    const { container } = renderWeekly(buildWeather({
      precipitation_probability_max: [null, 85, 90, 70, 10, 25, 30],
    }))

    const firstRain = container.querySelector('.day .d-rain')
    expect(firstRain.textContent.trim()).toBe('– · 2,0 mm')
    expect(container.querySelectorAll('.day')).toHaveLength(7)
  })

  test('mantém a seção com a classe de revelação e o atraso de .32s', () => {
    const { container } = renderWeekly(WEATHER_FIXTURE)

    const section = container.querySelector('section')
    expect(section).toHaveClass('card', 'reveal')
    expect(section.style.getPropertyValue('--d')).toBe('.32s')
    expect(section).toHaveAttribute('aria-label', 'Próximos sete dias')
    expect(section.querySelector('h2')).toHaveTextContent('Próximos 7 dias')
  })
})
