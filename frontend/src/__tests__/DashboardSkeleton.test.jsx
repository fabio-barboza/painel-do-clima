import React from 'react'
import { render } from '@testing-library/react'
import DashboardSkeleton from '../components/DashboardSkeleton.jsx'
import Dashboard from '../components/Dashboard.jsx'
import { WEATHER_FIXTURE } from './fixtures/weather.js'

const STAT_COUNT = 4
const DAY_COUNT = 7
const SHARED_BLOCK_SELECTORS = [
  '.grid-main',
  '.grid-main > .card.current',
  '.current-top',
  '.current-main',
  '.current-foot',
  '.grid-stats > .card.stat',
  '.weekly-grid > .day',
  '.d-name',
  '.d-date',
  '.d-temps',
  '.d-rain',
  '.bar',
]

function renderSkeleton() {
  return render(<DashboardSkeleton />)
}

describe('DashboardSkeleton', () => {
  test('repete as mesmas classes dos blocos reais', () => {
    const { container: skeletonRoot } = renderSkeleton()
    const { container: dataRoot } = render(
      <Dashboard weather={WEATHER_FIXTURE} locationLabel="Curitiba, Paraná" />,
    )

    SHARED_BLOCK_SELECTORS.forEach((selector) => {
      expect(skeletonRoot.querySelector(selector)).not.toBeNull()
      expect(dataRoot.querySelector(selector)).not.toBeNull()
    })
  })

  test('renderiza quatro cards de estatística e sete dias', () => {
    const { container } = renderSkeleton()

    expect(container.querySelectorAll('.stat')).toHaveLength(STAT_COUNT)
    expect(container.querySelectorAll('.day')).toHaveLength(DAY_COUNT)
  })

  test('marca o .temp com is-skel e usa placeholders skel', () => {
    const { container } = renderSkeleton()

    expect(container.querySelector('.temp')).toHaveClass('is-skel')
    expect(container.querySelector('.temp .skel')).toBeInTheDocument()
    expect(container.querySelectorAll('.skel').length).toBeGreaterThan(0)
  })

  test('não usa .reveal em nenhum bloco', () => {
    const { container } = renderSkeleton()

    expect(container.querySelector('.reveal')).toBeNull()
  })

  test('o gráfico usa a área de placeholder chart-skel', () => {
    const { container } = renderSkeleton()

    expect(container.querySelector('.chart-wrap .chart-skel')).toBeInTheDocument()
  })

  test('esconde o conteúdo decorativo de tecnologias assistivas', () => {
    const { container } = renderSkeleton()

    expect(container.querySelector('.grid-main')).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelector('.grid-stats')).toHaveAttribute('aria-hidden', 'true')
  })

  test('toda barra do skeleton define --w como 0%', () => {
    const { container } = renderSkeleton()
    const bars = container.querySelectorAll('.bar i')

    expect(bars).toHaveLength(STAT_COUNT + DAY_COUNT)
    bars.forEach((bar) => {
      expect(bar.style.getPropertyValue('--w')).toBe('0%')
    })
  })

  test('BugFix #02: should keep the unit of each stat value in <small> as the real panel when the skeleton renders', () => {
    const { container: skeletonRoot } = renderSkeleton()
    const { container: dataRoot } = render(
      <Dashboard weather={WEATHER_FIXTURE} locationLabel="Curitiba, Paraná" />,
    )
    const skeletonValues = skeletonRoot.querySelectorAll('.grid-stats .stat-val')
    const dataValues = dataRoot.querySelectorAll('.grid-stats .stat-val')

    expect(skeletonValues).toHaveLength(STAT_COUNT)
    expect(dataValues).toHaveLength(STAT_COUNT)
    skeletonValues.forEach((value, index) => {
      const dataSmallCount = dataValues[index].querySelectorAll('small').length
      expect(dataSmallCount).toBeGreaterThan(0)
      expect(value.querySelectorAll('small')).toHaveLength(dataSmallCount)
    })
  })
})
