import React from 'react'
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import EmptyState from '../components/EmptyState.jsx'
import Skeleton from '../components/Skeleton.jsx'
import ErrorState from '../components/ErrorState.jsx'
import SearchBar from '../components/SearchBar.jsx'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
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

const here = dirname(fileURLToPath(import.meta.url))
const indexCss = readFileSync(join(here, '../index.css'), 'utf8')

function declaredClasses(css) {
  const set = new Set()
  const re = /\.([\w-]+)/g
  let match
  while ((match = re.exec(css))) {
    set.add(match[1])
  }
  return set
}

function usedClasses(container) {
  const set = new Set()
  for (const el of container.querySelectorAll('*')) {
    if (typeof el.className === 'string') {
      for (const c of el.className.split(/\s+/)) {
        if (c) set.add(c)
      }
    }
  }
  return set
}

describe('EmptyState — unidade', () => {
  let onSearchFocus
  let onLocate
  beforeEach(() => {
    onSearchFocus = vi.fn()
    onLocate = vi.fn()
  })

  test('renderiza rótulos exatos e os 2 botões', () => {
    render(<EmptyState onSearchFocus={onSearchFocus} onLocate={onLocate} />)
    expect(screen.getByRole('heading', { name: 'Pesquise uma cidade' })).toBeInTheDocument()
    expect(screen.getByText('Digite o nome de uma cidade acima ou use sua localização para ver o clima agora.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pesquisar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Localização Atual' })).toBeInTheDocument()
  })

  test('botão Pesquisar dispara onSearchFocus', () => {
    render(<EmptyState onSearchFocus={onSearchFocus} onLocate={onLocate} />)
    fireEvent.click(screen.getByRole('button', { name: 'Pesquisar' }))
    expect(onSearchFocus).toHaveBeenCalledTimes(1)
    expect(onLocate).not.toHaveBeenCalled()
  })

  test('botão Localização Atual dispara onLocate', () => {
    render(<EmptyState onSearchFocus={onSearchFocus} onLocate={onLocate} />)
    fireEvent.click(screen.getByRole('button', { name: 'Localização Atual' }))
    expect(onLocate).toHaveBeenCalledTimes(1)
    expect(onSearchFocus).not.toHaveBeenCalled()
  })

  test('usa apenas classes do design system (FR-37)', () => {
    const { container } = render(<EmptyState onSearchFocus={onSearchFocus} onLocate={onLocate} />)
    const declared = declaredClasses(indexCss)
    for (const c of usedClasses(container)) {
      expect(declared.has(c)).toBe(true)
    }
  })
})

describe('ErrorState — unidade', () => {
  let onRetry
  let onFocusSearch
  beforeEach(() => {
    onRetry = vi.fn()
    onFocusSearch = vi.fn()
  })

  test('not-found: título, subtítulo e ação de foco', () => {
    render(<ErrorState kind="not-found" onRetry={onRetry} onFocusSearch={onFocusSearch} />)
    expect(screen.getByRole('heading', { name: 'Cidade não encontrada' })).toBeInTheDocument()
    expect(screen.getByText('Verifique a grafia do nome e tente novamente.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Nova busca' }))
    expect(onFocusSearch).toHaveBeenCalledTimes(1)
    expect(onRetry).not.toHaveBeenCalled()
  })

  test('bad-request: título, subtítulo e mesma ação de foco', () => {
    render(<ErrorState kind="bad-request" onRetry={onRetry} onFocusSearch={onFocusSearch} />)
    expect(screen.getByRole('heading', { name: 'Informe um nome de cidade' })).toBeInTheDocument()
    expect(screen.getByText('Digite o nome de uma cidade válida (ex.: Curitiba).')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Nova busca' }))
    expect(onFocusSearch).toHaveBeenCalledTimes(1)
    expect(onRetry).not.toHaveBeenCalled()
  })

  test('network: título, subtítulo e retry via onRetry', () => {
    render(<ErrorState kind="network" message="erro de teste" onRetry={onRetry} onFocusSearch={onFocusSearch} />)
    expect(screen.getByRole('heading', { name: 'Não foi possível carregar o clima' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
    expect(onFocusSearch).not.toHaveBeenCalled()
  })

  test('prop message sobrescreve o subtítulo padrão do kind', () => {
    render(<ErrorState kind="network" message="Subtítulo personalizado." onRetry={onRetry} onFocusSearch={onFocusSearch} />)
    expect(screen.getByText('Subtítulo personalizado.')).toBeInTheDocument()
    expect(screen.queryByText('Verifique sua conexão e tente novamente.')).not.toBeInTheDocument()
  })

  test('usa apenas classes do design system (FR-37)', () => {
    const { container } = render(<ErrorState kind="network" onRetry={onRetry} onFocusSearch={onFocusSearch} />)
    const declared = declaredClasses(indexCss)
    for (const c of usedClasses(container)) {
      expect(declared.has(c)).toBe(true)
    }
  })
})

describe('Skeleton — unidade', () => {
  test('espelha o layout carregado: atual, gráfico, 4 stats e 7 dias', () => {
    const { container } = render(<Skeleton variant="panel" />)
    expect(container.querySelectorAll('.sk').length).toBeGreaterThan(0)
    expect(container.querySelector('.grid-main')).toBeInTheDocument()
    expect(container.querySelector('.card.current')).toBeInTheDocument()
    expect(container.querySelector('.chart-wrap')).toBeInTheDocument()
    expect(container.querySelectorAll('.card.stat')).toHaveLength(4)
    expect(container.querySelectorAll('.weekly-grid .day')).toHaveLength(7)
    expect(container.querySelector('.temp-circle')).toBeInTheDocument()
    expect(container.querySelector('.chart-rect')).toBeInTheDocument()
  })

  test('revelação instantânea: sem classe reveal', () => {
    const { container } = render(<Skeleton variant="panel" />)
    expect(container.querySelector('.reveal')).toBeNull()
    expect(container.querySelectorAll('[aria-busy="true"]').length).toBeGreaterThan(0)
  })

  test('variantes distintas de "panel" renderizam nulo', () => {
    const { container } = render(<Skeleton variant="other" />)
    expect(container.innerHTML).toBe('')
  })

  test('usa apenas classes do design system (FR-37)', () => {
    const { container } = render(<Skeleton variant="panel" />)
    const declared = declaredClasses(indexCss)
    for (const c of usedClasses(container)) {
      expect(declared.has(c)).toBe(true)
    }
  })
})

function DataHarness() {
  const { status, error, search, locate, retry } = useWeather()

  function focusSearch() {
    const el = document.getElementById('searchInput')
    el?.focus()
    el?.select()
  }

  return (
    <>
      <Header />
      <SearchBar onSubmit={search} onLocate={locate} loading={status === 'loading'} geoError={error?.kind === 'geo' ? error.message : null} />
      <div className="dashboard-data">
        {status === 'idle' && <EmptyState onSearchFocus={focusSearch} onLocate={locate} />}
        {status === 'loading' && <Skeleton variant="panel" />}
        {status === 'error' && (
          <ErrorState kind={error.kind} message={error.message} onRetry={retry} onFocusSearch={focusSearch} />
        )}
      </div>
      <Footer />
    </>
  )
}

describe('Estados — integração com a estrutura do App', () => {
  test('estado vazio substitui os dados sem quebrar header/busca/rodapé', () => {
    render(<DataHarness />)
    expect(screen.getByRole('heading', { name: 'Painel do Clima' })).toBeInTheDocument()
    expect(screen.getByLabelText('Pesquisar cidade ou região')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Pesquise uma cidade' })).toBeInTheDocument()
  })

  test('estado de erro (bad-request) mantém a busca funcional e habilitada', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(200, makeEnvelope()))
    render(<DataHarness />)

    fireEvent.submit(screen.getByRole('search'))

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Informe um nome de cidade' })).toBeInTheDocument())
    expect(fetchSpy).not.toHaveBeenCalled()

    const form = screen.getByRole('search')
    expect(form).not.toHaveAttribute('disabled')
    const input = screen.getByLabelText('Pesquisar cidade ou região')
    expect(input).toBeEnabled()

    fireEvent.change(input, { target: { value: 'Curitiba' } })
    fireEvent.submit(form)
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1))
    expect(fetchSpy.mock.calls[0][0]).toBe('/api/weather?city=Curitiba')
    fetchSpy.mockRestore()
  })

  test('skeleton substitui os dados durante o loading', async () => {
    let release
    const pending = new Promise((resolve) => { release = () => resolve(jsonResponse(200, makeEnvelope())) })
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() => pending)
    render(<DataHarness />)
    fireEvent.change(screen.getByLabelText('Pesquisar cidade ou região'), { target: { value: 'Curitiba' } })
    fireEvent.submit(screen.getByRole('search'))
    const container = document.querySelector('.dashboard-data')
    await waitFor(() => expect(container.querySelector('.sk')).toBeInTheDocument())
    expect(container.querySelector('.reveal')).toBeNull()
    release()
    await waitFor(() => expect(container.querySelector('.sk')).toBeNull())
    expect(screen.getByRole('heading', { name: 'Painel do Clima' })).toBeInTheDocument()
    fetchSpy.mockRestore()
  })
})
