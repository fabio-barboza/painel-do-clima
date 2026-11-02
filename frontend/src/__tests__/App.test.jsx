import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import App from '../App'
import { WEATHER_FIXTURE } from './fixtures/weather.js'

describe('App', () => {
  test('renders app component', () => {
    render(<App />)

    // Verifica se o componente foi renderizado sem erros
    expect(App).toBeDefined()
  })

  test('renderiza o fundo de referência antes de main.dashboard', () => {
    const { container } = render(<App />)
    const sky = container.querySelector('.sky')
    const dashboard = screen.getByRole('main')

    expect(dashboard).toHaveClass('dashboard')
    expect(sky.compareDocumentPosition(dashboard) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  test('não dispara nenhuma chamada fetch ao abrir', () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    try {
      render(<App />)

      expect(fetchSpy).not.toHaveBeenCalled()
    } finally {
      vi.unstubAllGlobals()
    }
  })

  test('renderiza cabeçalho, relógio e rodapé dentro de main.dashboard', () => {
    const { container } = render(<App />)
    const dashboard = screen.getByRole('main')

    expect(dashboard.querySelector('header.top')).toBeInTheDocument()
    expect(dashboard.querySelector('header .clock #clockTime')).toBeInTheDocument()
    expect(dashboard.querySelector('footer')).toHaveTextContent('Open-Meteo.com')
    expect(container.querySelectorAll('header.top')).toHaveLength(1)
  })

  test('em estado vazio mostra cabeçalho, busca, card vazio e rodapé sem chamar fetch', () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    try {
      const { container } = render(<App />)
      const dashboard = screen.getByRole('main')

      expect(dashboard.querySelector('header.top')).toBeInTheDocument()
      expect(dashboard.querySelector('.search[role="search"] #searchInput')).toBeInTheDocument()
      expect(dashboard.querySelector('#btnSearch')).toBeInTheDocument()
      expect(dashboard.querySelector('#btnLocate')).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 2, name: 'Consulte o clima' })).toBeInTheDocument()
      expect(dashboard.querySelector('footer')).toHaveTextContent('Open-Meteo.com')
      expect(container.querySelectorAll('.search')).toHaveLength(1)
      expect(fetchSpy).not.toHaveBeenCalled()
    } finally {
      vi.unstubAllGlobals()
    }
  })
})

describe('App smoke com a fixture', () => {
  const CURITIBA_URL = 'http://localhost:3000/api/weather?city=Curitiba'
  const SEARCH_PLACEHOLDER = 'Pesquisar cidade ou região…'
  const STAT_COUNT = 4
  const DAY_COUNT = 7
  const POINT_COUNT = 24

  function jsonResponse(status, body) {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
  }

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('após a busca mostra seções principais, 4 stats, 7 dias e 24 pontos', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, WEATHER_FIXTURE))
    vi.stubGlobal('fetch', fetchMock)
    const { container } = render(<App />)

    fireEvent.change(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), { target: { value: 'Curitiba' } })
    fireEvent.click(document.getElementById('btnSearch'))

    await waitFor(() => expect(container.querySelector('#chartCard')).toBeInTheDocument())
    expect(fetchMock).toHaveBeenCalledWith(CURITIBA_URL, expect.objectContaining({ cache: 'no-store' }))
    expect(screen.getByRole('heading', { name: 'Previsão por hora' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Próximos 7 dias' })).toBeInTheDocument()
    expect(container.querySelectorAll('.grid-stats > .stat')).toHaveLength(STAT_COUNT)
    expect(container.querySelectorAll('.day')).toHaveLength(DAY_COUNT)
    expect(container.querySelectorAll('.pt')).toHaveLength(POINT_COUNT)
    expect(container.querySelector('.skel')).toBeNull()
  })
})
