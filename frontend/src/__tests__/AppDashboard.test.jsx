import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import App from '../App'
import { WEATHER_FIXTURE } from './fixtures/weather.js'

const CURITIBA_URL = 'http://localhost:3000/api/weather?city=Curitiba'
const EMPTY_HEADING = 'Consulte o clima'
const LOCATION_LABEL = 'Curitiba, Paraná'

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

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

function searchCity(text) {
  fireEvent.change(screen.getByPlaceholderText('Pesquisar cidade ou região…'), { target: { value: text } })
  fireEvent.click(document.getElementById('btnSearch'))
}

describe('App: da busca ao card atual', () => {
  beforeEach(() => {
    mockReducedMotion()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  test('busca bem-sucedida exibe o card com os valores da resposta e sem estado vazio', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, WEATHER_FIXTURE))
    vi.stubGlobal('fetch', fetchMock)
    const { container } = render(<App />)

    searchCity('Curitiba')

    await waitFor(() => expect(container.querySelector('section.current')).toBeInTheDocument())
    expect(fetchMock).toHaveBeenCalledWith(CURITIBA_URL, expect.objectContaining({ cache: 'no-store' }))
    expect(screen.queryByRole('heading', { name: EMPTY_HEADING })).not.toBeInTheDocument()
    expect(container.querySelector('#locName').textContent).toBe(LOCATION_LABEL)
    expect(container.querySelector('#tempVal').textContent).toBe('26')
    expect(container.querySelector('#maxT').textContent).toBe('26°')
    expect(container.querySelector('#minT').textContent).toBe('12°')
    expect(container.querySelector('#feels').textContent).toBe('28°')
    expect(container.querySelector('.condition').textContent).toBe('Parcialmente nublado')
  })

  test('busca bem-sucedida renderiza 4 .stat como filhos diretos de .grid-stats com os valores da fixture', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, WEATHER_FIXTURE)))
    const { container } = render(<App />)

    searchCity('Curitiba')

    await waitFor(() => expect(container.querySelector('.grid-stats')).toBeInTheDocument())
    const grid = container.querySelector('.grid-stats')
    expect(grid.children).toHaveLength(4)
    expect(grid.querySelectorAll(':scope > .card.stat')).toHaveLength(4)
    expect(container.querySelector('#statFeels').innerHTML).toBe('28<small> °C</small>')
    expect(grid.querySelectorAll('.stat-val')[1].innerHTML).toBe('62<small> %</small>')
    expect(grid.querySelectorAll('.stat-val')[2].innerHTML).toBe('14<small> km/h · NNO</small>')
    expect(grid.querySelectorAll('.stat-val')[3].innerHTML).toBe('6 <small>· Alto</small>')
    expect(grid.querySelector('.bar-uv i').style.getPropertyValue('--w')).toBe('50%')
  })

  test('o card não aparece antes da primeira consulta', () => {
    const { container } = render(<App />)

    expect(container.querySelector('section.current')).not.toBeInTheDocument()
  })
})
