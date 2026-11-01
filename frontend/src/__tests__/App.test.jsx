import React from 'react'
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../App'

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }
}

const seq = (n) => Array.from({ length: n }, (_, i) => i)

const DAILY_DATES = [
  '2026-10-27', '2026-10-28', '2026-10-29',
  '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02',
]
const HOURLY_TIMES = seq(24).map((i) => `2026-10-27T${String(i).padStart(2, '0')}:00`)

function makeEnvelope(overrides = {}) {
  return {
    city: { name: 'Curitiba', region: 'Paraná', display: 'Curitiba, Paraná', latitude: -25.43, longitude: -49.27 },
    timezone: 'America/Sao_Paulo',
    current: {
      time: '2026-10-27T19:15',
      temperature_2m: 19.7,
      relative_humidity_2m: 71,
      apparent_temperature: 21.4,
      precipitation: 0,
      weather_code: 0,
      wind_speed_10m: 12,
      wind_direction_10m: 180,
      uv_index: 5,
    },
    hourly: {
      time: HOURLY_TIMES,
      temperature_2m: seq(24),
      precipitation: seq(24),
      weather_code: seq(24),
    },
    daily: {
      time: DAILY_DATES,
      temperature_2m_max: [28, 27, 26, 25, 24, 23, 22],
      temperature_2m_min: [12, 11, 10, 9, 8, 7, 6],
      precipitation_probability_max: [10, 20, 30, 40, 50, 60, 70],
      precipitation_sum: [0, 0, 2, 4, 6, 1, 0],
      weather_code: [0, 1, 2, 3, 61, 63, 80],
    },
    ...overrides,
  }
}

function setGeo(behavior) {
  vi.stubGlobal('navigator', { ...globalThis.navigator, geolocation: { getCurrentPosition: vi.fn(behavior) } })
}

describe('App — composição por estado e data-tint', () => {
  let fetchSpy
  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(200, makeEnvelope()))
  })
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  test('estado inicial (idle): EmptyState + busca em destaque, raiz data-tint clear', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Pesquise uma cidade' })).toBeInTheDocument()
    expect(screen.getByLabelText('Pesquisar cidade ou região')).toBeInTheDocument()
    expect(document.querySelector('[data-tint]')).toHaveAttribute('data-tint', 'clear')
  })

  test('loading: Skeleton em todas as seções + busca com aria-busy', () => {
    fetchSpy.mockImplementation(() => new Promise(() => {}))
    render(<App />)

    const input = screen.getByLabelText('Pesquisar cidade ou região')
    fireEvent.change(input, { target: { value: 'Curitiba' } })
    fireEvent.submit(screen.getByRole('search'))

    expect(screen.getByRole('search')).toHaveAttribute('aria-busy', 'true')
    const container = document.querySelector('.dashboard')
    expect(container.querySelector('.grid-main')).toBeInTheDocument()
    expect(container.querySelector('.grid-stats .card.stat')).toBeInTheDocument()
    expect(container.querySelector('.weekly-grid .day')).toBeInTheDocument()
    expect(container.querySelector('.grid-main .reveal')).toBeNull()
  })

  test('fumaça (sucesso principal): idle → aria-busy/Skeleton → success com 4 blocos + data-tint', async () => {
    render(<App />)

    // idle: EmptyState em destaque
    expect(screen.getByRole('heading', { name: 'Pesquise uma cidade' })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Pesquisar cidade ou região'), { target: { value: 'Curitiba' } })
    fireEvent.submit(screen.getByRole('search'))

    // loading: busca com aria-busy + skeleton
    expect(screen.getByRole('search')).toHaveAttribute('aria-busy', 'true')
    await waitFor(() => expect(document.querySelector('.dashboard .grid-main .sk')).toBeInTheDocument())

    // success: os 4 blocos + tint aplicado (fluxo de sucesso principal)
    await waitFor(() => expect(screen.getByText('Curitiba, Paraná')).toBeInTheDocument())
    await waitFor(() => expect(document.querySelector('.dashboard .grid-main .sk')).toBeNull())
    expect(document.querySelector('.card.current')).toBeInTheDocument()
    expect(document.querySelectorAll('#chartSvg .pt')).toHaveLength(24)
    expect(document.querySelectorAll('.grid-stats .card.stat')).toHaveLength(4)
    expect(document.querySelectorAll('.weekly-grid .day')).toHaveLength(7)
    expect(screen.getByText('Atualizado 19:15')).toBeInTheDocument()
    expect(document.querySelector('[data-tint]')).toHaveAttribute('data-tint', 'clear')
  })

  test('success: data-tint reflete a condição (chuva code 61 → rain)', async () => {
    fetchSpy.mockResolvedValue(jsonResponse(200, makeEnvelope({ current: { ...makeEnvelope().current, weather_code: 61 } })))
    render(<App />)
    fireEvent.change(screen.getByLabelText('Pesquisar cidade ou região'), { target: { value: 'Curitiba' } })
    fireEvent.submit(screen.getByRole('search'))
    await waitFor(() => expect(screen.getByText('Chuva fraca')).toBeInTheDocument())
    expect(document.querySelector('[data-tint]')).toHaveAttribute('data-tint', 'rain')
  })

  test('not-found (404): mensagem amigável + painel utilizável (busca funciona)', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse(404, { error: 'não' }))
    render(<App />)
    fireEvent.change(screen.getByLabelText('Pesquisar cidade ou região'), { target: { value: 'Xanadu' } })
    fireEvent.submit(screen.getByRole('search'))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Cidade não encontrada' })).toBeInTheDocument())
    // painel permanece utilizável: nova busca dispara fetch
    fireEvent.change(screen.getByLabelText('Pesquisar cidade ou região'), { target: { value: 'Curitiba' } })
    fireEvent.submit(screen.getByRole('search'))
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2))
  })

  test('network: retry refaz a consulta', async () => {
    fetchSpy.mockResolvedValueOnce(jsonResponse(500, { error: 'servidor' }))
    render(<App />)
    fireEvent.change(screen.getByLabelText('Pesquisar cidade ou região'), { target: { value: 'Curitiba' } })
    fireEvent.submit(screen.getByRole('search'))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Não foi possível carregar o clima' })).toBeInTheDocument())
    expect(fetchSpy).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2))
    expect(fetchSpy.mock.calls[1][0]).toBe('/api/weather?city=Curitiba')
  })

  test('geo negada: .search-error + busca por cidade segue funcionando', async () => {
    setGeo((_success, error) => error({ code: 1 }))
    render(<App />)

    const locateBtn = screen.getByRole('search').querySelector('button[title="Usar minha localização"]')
    fireEvent.click(locateBtn)
    expect(screen.getByRole('alert')).toHaveTextContent('Localização negada.')
    expect(document.querySelector('.search-error')).toBeInTheDocument()

    // busca por cidade funciona apesar do erro de geo
    fireEvent.change(screen.getByLabelText('Pesquisar cidade ou região'), { target: { value: 'Curitiba' } })
    fireEvent.submit(screen.getByRole('search'))
    await waitFor(() => expect(fetchSpy).toHaveBeenCalled())
  })

  test('remontagem do gráfico a cada busca (novo key → novo SVG)', async () => {
    fetchSpy.mockResolvedValue(jsonResponse(200, makeEnvelope({ current: { ...makeEnvelope().current, time: '2026-10-27T10:00' } })))
    render(<App />)
    fireEvent.change(screen.getByLabelText('Pesquisar cidade ou região'), { target: { value: 'Curitiba' } })
    fireEvent.submit(screen.getByRole('search'))
    await waitFor(() => expect(document.querySelector('#chartSvg')).toBeInTheDocument())
    const firstSvg = document.querySelector('#chartSvg')

    fetchSpy.mockResolvedValue(jsonResponse(200, makeEnvelope({
      city: { name: 'Rio de Janeiro', region: 'Rio de Janeiro', display: 'Rio de Janeiro, Rio de Janeiro', latitude: -22.9, longitude: -43.17 },
      current: { ...makeEnvelope().current, time: '2026-10-27T11:30' },
    })))
    fireEvent.change(screen.getByLabelText('Pesquisar cidade ou região'), { target: { value: 'Rio de Janeiro' } })
    fireEvent.submit(screen.getByRole('search'))
    await waitFor(() => expect(screen.getByText('Rio de Janeiro, Rio de Janeiro')).toBeInTheDocument())
    await waitFor(() => expect(document.querySelector('#chartSvg')).not.toBe(firstSvg))
  })
})
