import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import App from '../App'
import { WEATHER_FIXTURE } from './fixtures/weather.js'

const CURITIBA_URL = 'http://localhost:3000/api/weather?city=Curitiba'
const SEARCH_PLACEHOLDER = 'Pesquisar cidade ou região…'
const HOURS_IN_DAY = 24

class ImmediateIntersectionObserver {
  constructor(callback) {
    this.callback = callback
  }

  observe(target) {
    this.callback([{ isIntersecting: true, target }], this)
  }

  unobserve() {}

  disconnect() {}
}

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

async function searchCuritiba(container) {
  fireEvent.change(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), { target: { value: 'Curitiba' } })
  fireEvent.click(document.getElementById('btnSearch'))
  await waitFor(() => expect(container.querySelector('#chartCard')).toBeInTheDocument())
}

describe('App com a previsão por hora', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', ImmediateIntersectionObserver)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, WEATHER_FIXTURE)))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('exibe o card de previsão por hora como segunda coluna de .grid-main, ao lado de CurrentCard', async () => {
    const { container } = render(<App />)

    await searchCuritiba(container)

    const grid = container.querySelector('.grid-main')
    expect(grid.children[0]).toHaveClass('current')
    expect(grid.children[1]).toBe(container.querySelector('#chartCard'))
  })

  test('busca a cidade pelo endpoint do backend e desenha as 24 horas do gráfico', async () => {
    const { container } = render(<App />)

    await searchCuritiba(container)

    expect(globalThis.fetch).toHaveBeenCalledWith(CURITIBA_URL, expect.objectContaining({ cache: 'no-store' }))
    expect(container.querySelectorAll('#chartCard .pt')).toHaveLength(HOURS_IN_DAY)
  })

  test('aplica .in ao card e .show à área após a revelação', async () => {
    const { container } = render(<App />)

    await searchCuritiba(container)

    await waitFor(() => expect(container.querySelector('#chartCard')).toHaveClass('in'))
    await waitFor(() => expect(container.querySelector('#chartCard .area-path')).toHaveClass('show'))
    expect(container.querySelector('#chartCard .pt')).toHaveClass('show')
  })
})
