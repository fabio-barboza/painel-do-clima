import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import App from '../App'
import { WEATHER_FIXTURE } from './fixtures/weather.js'

const SEARCH_PLACEHOLDER = 'Pesquisar cidade ou região…'
const LOADING_ANNOUNCEMENT = 'Carregando dados do clima'
const NOT_FOUND_MESSAGE = 'Não encontramos essa cidade. Confira o nome e tente novamente.'
const NETWORK_MESSAGE = 'Não foi possível obter os dados do clima agora.'
const RETRY_LABEL = 'Tentar novamente'

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

function createDeferred() {
  let resolve
  const promise = new Promise((resolver) => {
    resolve = resolver
  })
  return { promise, resolve }
}

function searchFor(text) {
  fireEvent.change(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), { target: { value: text } })
  fireEvent.click(document.getElementById('btnSearch'))
}

async function loadFixture(container) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(jsonResponse(200, WEATHER_FIXTURE)))
  searchFor('Curitiba')
  await waitFor(() => expect(container.querySelector('#chartCard')).toBeInTheDocument())
}

describe('App com feedback de carregamento e erro', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('durante a consulta mostra skeleton, aria-busy e anúncio de carregamento', () => {
    const pending = createDeferred()
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(pending.promise))
    const { container } = render(<App />)

    searchFor('Curitiba')

    expect(container.querySelector('.skel')).toBeInTheDocument()
    expect(container.querySelector('main')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByText(LOADING_ANNOUNCEMENT)).toBeInTheDocument()
    expect(container.querySelector('#chartCard')).toBeNull()
  })

  test('ao concluir a consulta remove skeleton, aria-busy e anúncio', async () => {
    const pending = createDeferred()
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(pending.promise))
    const { container } = render(<App />)
    searchFor('Curitiba')

    await act(async () => {
      pending.resolve(jsonResponse(200, WEATHER_FIXTURE))
    })

    await waitFor(() => expect(container.querySelector('#chartCard')).toBeInTheDocument())
    expect(container.querySelector('.skel')).toBeNull()
    expect(container.querySelector('main')).not.toHaveAttribute('aria-busy')
    expect(screen.queryByText(LOADING_ANNOUNCEMENT)).not.toBeInTheDocument()
  })

  test('a região de status fica sempre montada, mesmo sem carregamento', () => {
    const { container } = render(<App />)

    expect(container.querySelectorAll('.sr-only[role="status"]')).toHaveLength(1)
  })

  test('erro com dados na tela preserva os dados e mostra a mensagem', async () => {
    const { container } = render(<App />)
    await loadFixture(container)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(404, { error: { code: 'CITY_NOT_FOUND', message: 'x' } })))

    searchFor('Xyzzy')

    expect(await screen.findByRole('alert')).toHaveTextContent(NOT_FOUND_MESSAGE)
    expect(container.querySelector('#chartCard')).toBeInTheDocument()
    expect(container.querySelectorAll('.day')).toHaveLength(7)
    expect(screen.queryByRole('button', { name: RETRY_LABEL })).not.toBeInTheDocument()
  })

  test('falha de comunicação com dados preserva a tela e "Tentar novamente" repete a última consulta', async () => {
    const { container } = render(<App />)
    await loadFixture(container)
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(502, { error: { code: 'UPSTREAM_ERROR', message: 'x' } }))
      .mockResolvedValueOnce(jsonResponse(200, WEATHER_FIXTURE))
    vi.stubGlobal('fetch', fetchMock)

    searchFor('Curitiba')

    expect(await screen.findByRole('alert')).toHaveTextContent(NETWORK_MESSAGE)
    expect(container.querySelector('#chartCard')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: RETRY_LABEL }))
    })

    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[1][0]).toBe(fetchMock.mock.calls[0][0])
  })
})
