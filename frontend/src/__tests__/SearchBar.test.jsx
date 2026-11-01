import React from 'react'
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SearchBar from '../components/SearchBar.jsx'
import useWeather from '../hooks/useWeather.js'

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }
}

function makeEnvelope() {
  const seq = (n) => Array.from({ length: n }, (_, i) => i)
  return {
    city: { name: 'Curitiba', region: 'Paraná', display: 'Curitiba, Paraná', latitude: -25.43, longitude: -49.27 },
    timezone: 'America/Sao_Paulo',
    current: { temperature_2m: 20, weather_code: 0 },
    hourly: { time: seq(24), temperature_2m: seq(24), precipitation: seq(24), weather_code: seq(24) },
    daily: {
      time: seq(7),
      temperature_2m_max: seq(7),
      temperature_2m_min: seq(7),
      precipitation_probability_max: seq(7),
      precipitation_sum: seq(7),
      weather_code: seq(7),
    },
  }
}

function setGeo(behavior) {
  vi.stubGlobal('navigator', { ...globalThis.navigator, geolocation: { getCurrentPosition: vi.fn(behavior) } })
}

function Harness() {
  const { status, error, search, locate } = useWeather()
  return (
    <SearchBar
      onSubmit={search}
      onLocate={locate}
      loading={status === 'loading'}
      geoError={error?.kind === 'geo' ? error.message : null}
    />
  )
}

describe('SearchBar — unidade', () => {
  let onSubmit
  let onLocate
  beforeEach(() => {
    onSubmit = vi.fn()
    onLocate = vi.fn()
  })

  test('renderiza input com rótulo acessível e 2 botões', () => {
    render(<SearchBar onSubmit={onSubmit} onLocate={onLocate} loading={false} geoError={null} />)
    expect(screen.getByLabelText('Pesquisar cidade ou região')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pesquisar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Localização Atual' })).toBeInTheDocument()
    expect(screen.getByRole('search')).toBeInTheDocument()
  })

  test('Enter (submit do form) envia o valor filtrado', () => {
    render(<SearchBar onSubmit={onSubmit} onLocate={onLocate} loading={false} geoError={null} />)
    const input = screen.getByLabelText('Pesquisar cidade ou região')
    const form = screen.getByRole('search')
    fireEvent.change(input, { target: { value: '  Curitiba ' } })
    fireEvent.submit(form)
    expect(onSubmit).toHaveBeenCalledWith('Curitiba')
  })

  test('clique no botão Pesquisar envia o valor', () => {
    render(<SearchBar onSubmit={onSubmit} onLocate={onLocate} loading={false} geoError={null} />)
    fireEvent.change(screen.getByLabelText('Pesquisar cidade ou região'), { target: { value: 'São Paulo' } })
    fireEvent.click(screen.getByRole('button', { name: 'Pesquisar' }))
    expect(onSubmit).toHaveBeenCalledWith('São Paulo')
  })

  test('clique no botão Localização Atual dispara onLocate', () => {
    render(<SearchBar onSubmit={onSubmit} onLocate={onLocate} loading={false} geoError={null} />)
    fireEvent.click(screen.getByRole('button', { name: 'Localização Atual' }))
    expect(onLocate).toHaveBeenCalledTimes(1)
  })

  test('envio vazio (só espaços) envia string vazia após trim — contrato: onSubmit sempre chamado', () => {
    render(<SearchBar onSubmit={onSubmit} onLocate={onLocate} loading={false} geoError={null} />)
    fireEvent.change(screen.getByLabelText('Pesquisar cidade ou região'), { target: { value: '   ' } })
    fireEvent.submit(screen.getByRole('search'))
    expect(onSubmit).toHaveBeenCalledWith('')
  })

  test('loading → aria-busy + spinner substitui o ícone do botão primary', () => {
    render(<SearchBar onSubmit={onSubmit} onLocate={onLocate} loading geoError={null} />)
    const form = screen.getByRole('search')
    const button = screen.getByRole('button', { name: 'Pesquisar' })
    expect(form).toHaveAttribute('aria-busy', 'true')
    expect(button).toHaveClass('is-loading')
    expect(button.querySelector('.spin')).toBeTruthy()
  })

  test('geoError → mensagem renderizada em .search-error', () => {
    render(<SearchBar onSubmit={onSubmit} onLocate={onLocate} loading={false} geoError="Localização negada." />)
    expect(screen.getByText('Localização negada.')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveClass('search-error')
  })
})

describe('SearchBar — integração com useWeather', () => {
  let fetchSpy
  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(200, makeEnvelope()))
  })

  test('submeter cidade → loading no botão → sucesso', async () => {
    render(<Harness />)
    const input = screen.getByLabelText('Pesquisar cidade ou região')
    const form = screen.getByRole('search')
    fireEvent.change(input, { target: { value: 'Curitiba' } })
    fireEvent.submit(form)

    const button = screen.getByRole('button', { name: 'Pesquisar' })
    expect(button).toHaveClass('is-loading')
    expect(form).toHaveAttribute('aria-busy', 'true')
    expect(fetchSpy).toHaveBeenCalledTimes(1)

    await waitFor(() => expect(form).not.toHaveAttribute('aria-busy', 'true'))
    expect(fetchSpy.mock.calls[0][0]).toBe('/api/weather?city=Curitiba')
  })

  test('submeter vazio → erro bad-request sem chamar fetch', () => {
    render(<Harness />)
    fireEvent.submit(screen.getByRole('search'))
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  test('geolocalização negada → .search-error amigável e busca por cidade segue funcionando', async () => {
    setGeo((_success, error) => error({ code: 1 }))
    render(<Harness />)

    fireEvent.click(screen.getByRole('button', { name: 'Localização Atual' }))
    await waitFor(() => expect(screen.getByText('Localização negada.')).toBeInTheDocument())

    const input = screen.getByLabelText('Pesquisar cidade ou região')
    fireEvent.change(input, { target: { value: 'Curitiba' } })
    fireEvent.submit(screen.getByRole('search'))
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1))
    expect(screen.queryByText('Localização negada.')).not.toBeInTheDocument()
  })
})
