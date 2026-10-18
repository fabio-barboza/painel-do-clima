import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import WeeklyForecast from '../components/WeeklyForecast.jsx'
import { deriveDaily7, formatDayPt } from '../utils/weatherCode.js'

const DAILY = [
  { date: '2026-10-17', code: 2, tMin: 10, tMax: 20, precip: 0 },
  { date: '2026-10-18', code: 3, tMin: 12, tMax: 24, precip: 1.5 },
  { date: '2026-10-19', code: 61, tMin: 8, tMax: 22, precip: 4 },
  { date: '2026-10-20', code: 95, tMin: 14, tMax: 28, precip: 6.5 },
  { date: '2026-10-21', code: 51, tMin: 9, tMax: 15, precip: 2 },
  { date: '2026-10-22', code: 0, tMin: 13, tMax: 19, precip: 0 },
  { date: '2026-10-23', code: 1, tMin: 11, tMax: 26, precip: 8 },
]

function buildForecast(daily = DAILY) {
  return {
    daily: {
      time: daily.map((entry) => entry.date),
      weather_code: daily.map((entry) => entry.code),
      temperature_2m_min: daily.map((entry) => entry.tMin),
      temperature_2m_max: daily.map((entry) => entry.tMax),
      precipitation_sum: daily.map((entry) => entry.precip),
    },
  }
}

function renderWeekly(days = deriveDaily7(buildForecast())) {
  const { container } = render(<WeeklyForecast days={days} />)
  return { container }
}

function rangeBarOf(weekday) {
  return screen.getByRole('img', { name: new RegExp(`Variação de temperatura de .* em ${weekday}`) })
}

function rainTrackOf(weekday) {
  return screen.getByRole('img', { name: new RegExp(`Chuva prevista de .* em ${weekday}`) })
}

function barOf(weekday) {
  return rangeBarOf(weekday).querySelector('.weekly-day-range-bar')
}

describe('deriveDaily7', () => {
  it('deriva 7 pontos com date, weekday, weatherCode, tMin, tMax e precipitation', () => {
    const days = deriveDaily7(buildForecast())
    expect(days).toHaveLength(7)
    expect(days[0]).toEqual({
      date: '2026-10-17',
      weekday: 'sáb., 17/10',
      weatherCode: 2,
      tMin: 10,
      tMax: 20,
      precipitation: 0,
    })
    expect(days[3]).toEqual({
      date: '2026-10-20',
      weekday: 'ter., 20/10',
      weatherCode: 95,
      tMin: 14,
      tMax: 28,
      precipitation: 6.5,
    })
    days.forEach((day) => {
      expect(day.weekday).toBe(formatDayPt(day.date))
    })
  })

  it('limita a 7 dias quando daily possui mais entradas', () => {
    const extra = [...DAILY, ...DAILY.slice(0, 3)]
    const days = deriveDaily7(buildForecast(extra))
    expect(days).toHaveLength(7)
    expect(days[6].date).toBe('2026-10-23')
  })

  it('retorna lista vazia quando não há dados daily', () => {
    expect(deriveDaily7({})).toEqual([])
    expect(deriveDaily7(null)).toEqual([])
    expect(deriveDaily7({ daily: {} })).toEqual([])
  })
})

describe('WeeklyForecast', () => {
  it('renderiza 7 cards, um por dia', () => {
    const { container } = renderWeekly()
    expect(container.querySelectorAll('.weekly-day')).toHaveLength(7)
    expect(screen.getAllByRole('listitem')).toHaveLength(7)
  })

  it('exibe o dia de cada card formatado em PT-BR', () => {
    renderWeekly()
    const weekdays = ['sáb., 17/10', 'dom., 18/10', 'seg., 19/10', 'ter., 20/10', 'qua., 21/10', 'qui., 22/10', 'sex., 23/10']
    weekdays.forEach((weekday) => {
      expect(screen.getAllByText(weekday)).not.toHaveLength(0)
    })
  })

  it('exibe temperatura mínima e máxima em °C para cada dia', () => {
    renderWeekly()
    expect(screen.getAllByText('8,0 °C')).toHaveLength(2)
    expect(screen.getAllByText('28,0 °C')).toHaveLength(2)
    expect(screen.getAllByText('10,0 °C')).toHaveLength(2)
    expect(screen.getAllByText('26,0 °C')).toHaveLength(2)
  })

  it('posiciona a barra de intervalo mín/máx relativa à escala da semana', () => {
    renderWeekly()
    expect(barOf('sáb., 17/10')).toHaveStyle({ left: '10%', width: '50%' })
    expect(barOf('seg., 19/10')).toHaveStyle({ left: '0%', width: '70%' })
    expect(barOf('ter., 20/10')).toHaveStyle({ left: '30%', width: '70%' })
    expect(barOf('sex., 23/10')).toHaveStyle({ left: '15%', width: '75%' })
  })

  it('alinha a barra de intervalo à escala da semana: mínima da semana em 0% e máxima em 100%', () => {
    renderWeekly()
    expect(parseFloat(barOf('seg., 19/10').style.left)).toBe(0)
    const maxDayBar = barOf('ter., 20/10')
    expect(parseFloat(maxDayBar.style.left) + parseFloat(maxDayBar.style.width)).toBe(100)
  })

  it('exibe o volume de chuva com indicador proporcional ao maior volume da semana', () => {
    renderWeekly()
    const fillOf = (weekday) => rainTrackOf(weekday).querySelector('.weekly-day-rain-fill')
    expect(fillOf('sex., 23/10')).toHaveStyle({ width: '100%' })
    expect(fillOf('ter., 20/10')).toHaveStyle({ width: '81.25%' })
    expect(fillOf('seg., 19/10')).toHaveStyle({ width: '50%' })
    expect(fillOf('sáb., 17/10')).toHaveStyle({ width: '0%' })
    expect(fillOf('qui., 22/10')).toHaveStyle({ width: '0%' })
    expect(screen.getAllByText('8,0 mm')).toHaveLength(2)
    expect(screen.getAllByText('0,0 mm')).toHaveLength(4)
  })

  it('compara os volumes de chuva entre os 7 dias (maior preenchimento no dia de maior chuva)', () => {
    const { container } = renderWeekly()
    const fills = [...container.querySelectorAll('.weekly-day-rain-fill')].map(
      (fill) => parseFloat(fill.style.width),
    )
    expect(fills).toHaveLength(7)
    expect(fills.indexOf(Math.max(...fills))).toBe(6)
    expect(fills[6]).toBeGreaterThan(fills[2])
    expect(fills[2]).toBeGreaterThan(fills[4])
    expect(fills[4]).toBeGreaterThan(fills[1])
    expect(fills[1]).toBeGreaterThan(fills[0])
  })

  it('renderiza o ícone de clima da categoria do weather_code de cada dia', () => {
    const { container } = renderWeekly()
    expect(container.querySelectorAll('.weather-icon')).toHaveLength(7)
    expect(container.querySelectorAll('.wi-rain')).toHaveLength(2)
    expect(container.querySelectorAll('.wi-bolt')).toHaveLength(1)
    expect(container.querySelectorAll('.wi-sun-spin')).toHaveLength(3)
  })

  it('oferece label acessível descrevendo a variação mín/máx em cada card', () => {
    renderWeekly()
    const ranges = screen.getAllByRole('img', { name: /Variação de temperatura de / })
    expect(ranges).toHaveLength(7)
    expect(ranges[2]).toHaveAttribute(
      'aria-label',
      'Variação de temperatura de 8,0 °C a 22,0 °C em seg., 19/10',
    )
  })

  it('oferece label acessível e tabela oculta com os dados dos 7 dias', () => {
    renderWeekly()
    const rainLabels = screen.getAllByRole('img', { name: /Chuva prevista de / })
    expect(rainLabels).toHaveLength(7)
    expect(screen.getByRole('caption', { name: /próximos 7 dias/i })).toBeInTheDocument()
    const table = screen.getByRole('table')
    expect(table).toHaveClass('visually-hidden')
    expect(screen.getAllByRole('row')).toHaveLength(8)
  })

  it('é responsivo: grade de cards se adapta nos breakpoints 640px e 1024px', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/App.css'), 'utf-8')
    expect(css).toMatch(
      /\.weekly-forecast-list\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*1fr\)/,
    )
    expect(css).toMatch(
      /@media\s*\(min-width:\s*640px\)\s*\{[\s\S]*?\.weekly-forecast-list\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3,\s*1fr\)/,
    )
    expect(css).toMatch(
      /@media\s*\(min-width:\s*1024px\)\s*\{[\s\S]*?\.weekly-forecast-list\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3,\s*1fr\)/,
    )
    const { container } = renderWeekly()
    expect(container.querySelector('.weekly-forecast-list')).not.toBeNull()
  })

  it('renderiza vazio sem cards quando não há dias', () => {
    const { container } = renderWeekly([])
    expect(container.querySelectorAll('.weekly-day')).toHaveLength(0)
    expect(screen.getAllByRole('row')).toHaveLength(1)
  })
})
