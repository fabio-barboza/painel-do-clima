import React from 'react'
import { render } from '@testing-library/react'
import Dashboard from '../components/Dashboard.jsx'
import { WEATHER_FIXTURE } from './fixtures/weather.js'

describe('Dashboard', () => {
  beforeEach(() => {
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
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('agrupa o card atual dentro de .grid-main com o local recebido', () => {
    const { container } = render(<Dashboard weather={WEATHER_FIXTURE} locationLabel="Curitiba, Paraná" />)

    const grid = container.querySelector('.grid-main')
    expect(grid.querySelector('section.current #locName')).toHaveTextContent('Curitiba, Paraná')
    expect(grid.children).toHaveLength(2)
    expect(grid.querySelector('section.current + #chartCard')).toBeInTheDocument()
  })
})
