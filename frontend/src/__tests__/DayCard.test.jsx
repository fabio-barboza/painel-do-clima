import React from 'react'
import { render } from '@testing-library/react'
import DayCard from '../components/DayCard.jsx'

const TODAY_DAY = {
  key: '2026-08-16',
  label: 'Hoje',
  isToday: true,
  dateLabel: '16 ago',
  icon: 'i-cloud-sun',
  color: '#ffd76a',
  maximum: '26°',
  minimum: '12°',
  rain: '20% · 2,0 mm',
  range: { left: 12, width: 82 },
}

const OTHER_DAY = {
  key: '2026-08-17',
  label: 'Seg',
  isToday: false,
  dateLabel: '17 ago',
  icon: 'i-rain',
  color: '#7cc4ff',
  maximum: '22°',
  minimum: '11°',
  rain: '85% · 8,5 mm',
  range: { left: 6, width: 65 },
}

const MISSING_DAY = {
  ...OTHER_DAY,
  key: '2026-08-18',
  label: 'Ter',
  maximum: '–',
  minimum: '10°',
  rain: '– · –',
  range: { left: 0, width: 0 },
}

function renderDay(day) {
  return render(<DayCard day={day} />)
}

describe('DayCard', () => {
  test('marca o dia de hoje com .d-name.today e mostra nome e data', () => {
    const { container } = renderDay(TODAY_DAY)

    const name = container.querySelector('.day > .d-name')
    expect(name).toHaveClass('today')
    expect(name).toHaveTextContent('Hoje')
    expect(container.querySelector('.d-date')).toHaveTextContent('16 ago')
  })

  test('não marca como hoje os demais dias', () => {
    const { container } = renderDay(OTHER_DAY)

    const name = container.querySelector('.d-name')
    expect(name).not.toHaveClass('today')
    expect(name).toHaveTextContent('Seg')
  })

  test('usa o ícone e a cor da condição no .d-ico', () => {
    const { container } = renderDay(OTHER_DAY)

    const icon = container.querySelector('svg.d-ico')
    expect(icon).toHaveClass('ico')
    expect(icon.style.color).toBe('rgb(124, 196, 255)')
    expect(icon.querySelector('use').getAttribute('href')).toBe('#i-rain')
  })

  test('mostra máxima em <b> e mínima em <span> dentro de .d-temps', () => {
    const { container } = renderDay(TODAY_DAY)

    expect(container.querySelector('.d-temps b')).toHaveTextContent('26°')
    expect(container.querySelector('.d-temps span')).toHaveTextContent('12°')
  })

  test('mostra probabilidade e volume de chuva no .d-rain com o ícone de gota', () => {
    const { container } = renderDay(TODAY_DAY)

    const rain = container.querySelector('.d-rain')
    expect(rain).toHaveTextContent('20% · 2,0 mm')
    expect(rain.querySelector('use').getAttribute('href')).toBe('#i-drop')
  })

  test('posiciona a faixa de .d-range logo após .d-rain com --l e --w', () => {
    const { container } = renderDay(TODAY_DAY)

    const range = container.querySelector('.d-rain + .bar.d-range')
    expect(range).toBeInTheDocument()
    const bar = range.querySelector('i')
    expect(bar.style.getPropertyValue('--l')).toBe('12%')
    expect(bar.style.getPropertyValue('--w')).toBe('82%')
  })

  test('exibe o placeholder quando máxima e chuva são nulas', () => {
    const { container } = renderDay(MISSING_DAY)

    expect(container.querySelector('.d-temps b')).toHaveTextContent('–')
    expect(container.querySelector('.d-rain')).toHaveTextContent('– · –')
    expect(container.querySelector('.d-range i').style.getPropertyValue('--w')).toBe('0%')
  })
})
