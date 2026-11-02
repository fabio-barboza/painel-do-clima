import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import HourlyChart from '../components/HourlyChart.jsx'

const CHART_RECT = {
  left: 0,
  top: 0,
  width: 760,
  height: 300,
  right: 760,
  bottom: 300,
  x: 0,
  y: 0,
  toJSON() {},
}
const PLOT_LEFT = 44
const PLOT_WIDTH = 760 - 44 - 16
const HOURS = 24
const NULL_INDEX = 3
const STEP = PLOT_WIDTH / (HOURS - 1)

function buildSeries() {
  const times = Array.from({ length: HOURS }, (_, hour) => `2026-11-02T${String(hour).padStart(2, '0')}:00`)
  const temps = Array.from({ length: HOURS }, (_, hour) => 15 + (hour % 5))
  temps[NULL_INDEX] = null
  const precip = Array.from({ length: HOURS }, () => 0)
  return { times, temps, precip, nowIndex: -1 }
}

function renderChart() {
  return render(<HourlyChart {...buildSeries()} revealed={false} />)
}

describe('BugFix #BUG-01: should show a dash and not plot 0 degrees when an hour has no temperature', () => {
  beforeEach(() => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(CHART_RECT)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('tooltip of the null hour shows the dash without the degree unit', () => {
    const { container } = renderChart()

    fireEvent.mouseMove(container.querySelector('svg'), { clientX: PLOT_LEFT + NULL_INDEX * STEP })

    const tipText = container.querySelector('.tip').textContent
    expect(tipText.startsWith('03h · –')).toBe(true)
    expect(tipText).not.toContain('–°C')
    expect(tipText).not.toContain('°C')
  })

  test('tooltip of a valid hour keeps the temperature and unit', () => {
    const { container } = renderChart()

    fireEvent.mouseMove(container.querySelector('svg'), { clientX: PLOT_LEFT + 1 * STEP })

    expect(container.querySelector('.tip')).toHaveTextContent('01h · 16°C')
  })

  test('the scale ignores the null hour, so no axis label is 0 degrees', () => {
    const { container } = renderChart()

    const labels = Array.from(container.querySelectorAll('.axis-label')).map((node) => node.textContent)

    expect(labels).not.toContain('0°')
    expect(labels).toContain('12°')
  })

  test('the null hour draws no point and the hover dot is hidden over it', () => {
    const { container } = renderChart()

    expect(container.querySelectorAll('.pt')).toHaveLength(HOURS - 1)

    fireEvent.mouseMove(container.querySelector('svg'), { clientX: PLOT_LEFT + NULL_INDEX * STEP })

    expect(container.querySelector('.hoverdot')).toHaveStyle({ opacity: '0' })
  })
})
