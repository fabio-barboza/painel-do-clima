import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import App from '../App'
import { WEATHER_FIXTURE, WEEK } from './fixtures/weather.js'

const CURITIBA_URL = 'http://localhost:3000/api/weather?city=Curitiba'

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

describe('App: previsão de sete dias', () => {
  beforeEach(() => {
    mockReducedMotion()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  test('busca bem-sucedida renderiza 7 .day começando em Hoje com os valores da resposta', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, WEATHER_FIXTURE)))
    const { container } = render(<App />)

    searchCity('Curitiba')

    await waitFor(() => expect(container.querySelectorAll('#weeklyGrid > .day')).toHaveLength(7))
    const days = Array.from(container.querySelectorAll('#weeklyGrid > .day'))
    expect(days[0].querySelector('.d-name')).toHaveTextContent('Hoje')
    expect(days[0].querySelector('.d-name')).toHaveClass('today')
    days.forEach((day, index) => {
      expect(day.querySelector('.d-temps b').textContent).toBe(`${WEEK[index].max}°`)
      expect(day.querySelector('.d-temps span').textContent).toBe(`${WEEK[index].min}°`)
    })
  })

  test('consulta usa o endpoint do backend com cache no-store', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, WEATHER_FIXTURE))
    vi.stubGlobal('fetch', fetchMock)
    const { container } = render(<App />)

    searchCity('Curitiba')

    await waitFor(() => expect(container.querySelectorAll('.day')).toHaveLength(7))
    expect(fetchMock).toHaveBeenCalledWith(CURITIBA_URL, expect.objectContaining({ cache: 'no-store' }))
  })
})
