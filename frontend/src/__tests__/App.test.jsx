import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App.jsx'

const BASE_URL = 'http://api.test.local'

function payloadWith(weatherCode, cityName = 'São Paulo') {
  return {
    location: { name: cityName, country: 'Brasil' },
    forecast: {
      current: {
        temperature_2m: 18.3,
        relative_humidity_2m: 72,
        precipitation: 0,
        weather_code: weatherCode,
        wind_speed_10m: 11.4,
      },
    },
  }
}

function okResponse(body) {
  return { ok: true, status: 200, json: () => Promise.resolve(body) }
}

function errorResponse(status, body) {
  return { ok: false, status, json: () => Promise.resolve(body) }
}

function getShell() {
  return document.querySelector('.app-shell')
}

function submitSearch(city) {
  fireEvent.change(screen.getByRole('textbox', { name: 'Cidade' }), { target: { value: city } })
  fireEvent.submit(screen.getByRole('textbox', { name: 'Cidade' }).closest('form'))
}

describe('App (render integrado)', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', BASE_URL)
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('estado inicial: busca visível, sem dados, sem tema e sem alertas', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Painel do Clima')
    expect(screen.getByRole('textbox', { name: 'Cidade' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeInTheDocument()
    expect(screen.queryByRole('status', { name: /carregando/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Condições atuais' })).not.toBeInTheDocument()
    expect(getShell()).not.toHaveAttribute('data-theme')
  })

  it('loading: skeleton substitui os dados e a busca mostra feedback de carregamento', () => {
    fetch.mockImplementation(() => new Promise(() => {}))
    render(<App />)
    submitSearch('São Paulo')
    expect(screen.getByRole('status', { name: 'Carregando dados do clima' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Buscando…' })).toBeDisabled()
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch.mock.calls[0][0]).toBe(`${BASE_URL}/api/weather?city=S%C3%A3o%20Paulo`)
    expect(getShell()).not.toHaveAttribute('data-theme')
  })

  it('erro cidade não encontrada: mensagem amigável orientando nova tentativa, busca continua disponível', async () => {
    fetch.mockResolvedValue(
      errorResponse(404, { error: 'CITY_NOT_FOUND', message: "Cidade 'xyz' não encontrada." }),
    )
    render(<App />)
    submitSearch('xyz')
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Cidade não encontrada')
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Cidade' })).toBeEnabled()
    expect(getShell()).not.toHaveAttribute('data-theme')
  })

  it('erro de rede: mensagem amigável e "Tentar novamente" reexecuta a última busca', async () => {
    fetch
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValueOnce(okResponse(payloadWith(0)))
    render(<App />)
    submitSearch('São Paulo')
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Falha de comunicação')
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    await screen.findByRole('heading', { name: 'São Paulo' })
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch.mock.calls[1][0]).toBe(`${BASE_URL}/api/weather?city=S%C3%A3o%20Paulo`)
    expect(getShell()).toHaveAttribute('data-theme', 'clear')
  })

  it('sucesso: aplica o tema rain na raiz para weather_code de chuva e mostra o layout de dados', async () => {
    fetch.mockResolvedValue(okResponse(payloadWith(61)))
    render(<App />)
    submitSearch('São Paulo')
    await screen.findByRole('heading', { name: 'São Paulo' })
    expect(getShell()).toHaveAttribute('data-theme', 'rain')
    expect(screen.getByRole('heading', { name: 'Condições atuais' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Próximas 24 horas' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Próximos 7 dias' })).toBeInTheDocument()
  })

  it('sucesso: aplica o tema cloudy para código de névoa', async () => {
    fetch.mockResolvedValue(okResponse(payloadWith(45, 'Curitiba')))
    render(<App />)
    submitSearch('Curitiba')
    await screen.findByRole('heading', { name: 'Curitiba' })
    expect(getShell()).toHaveAttribute('data-theme', 'cloudy')
  })
})
