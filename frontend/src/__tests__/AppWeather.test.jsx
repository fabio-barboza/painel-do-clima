import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import App from '../App'
import { WEATHER_FIXTURE } from './fixtures/weather.js'

const CURITIBA_URL = 'http://localhost:3000/api/weather?city=Curitiba'
const NOT_FOUND_MESSAGE = 'Não encontramos essa cidade. Confira o nome e tente novamente.'
const NETWORK_MESSAGE = 'Não foi possível obter os dados do clima agora.'
const RETRY_LABEL = 'Tentar novamente'
const EMPTY_HEADING = 'Consulte o clima'

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

function typeCity(text) {
  fireEvent.change(screen.getByPlaceholderText('Pesquisar cidade ou região…'), { target: { value: text } })
}

function clickSearch() {
  fireEvent.click(document.getElementById('btnSearch'))
}

describe('App com a consulta do clima', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('estado vazio ao abrir, sem nenhuma chamada fetch', () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    render(<App />)

    expect(screen.getByRole('heading', { name: EMPTY_HEADING })).toBeInTheDocument()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  test('busca bem-sucedida chama GET /api/weather, sai do estado vazio e não mostra aviso', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, WEATHER_FIXTURE))
    vi.stubGlobal('fetch', fetchMock)
    render(<App />)

    typeCity('Curitiba')
    clickSearch()

    await waitFor(() => expect(screen.queryByRole('heading', { name: EMPTY_HEADING })).not.toBeInTheDocument())
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(CURITIBA_URL, expect.objectContaining({ cache: 'no-store' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  test('pesquisar com Enter dispara a mesma consulta', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, WEATHER_FIXTURE))
    vi.stubGlobal('fetch', fetchMock)
    render(<App />)

    typeCity('Curitiba')
    fireEvent.keyDown(screen.getByPlaceholderText('Pesquisar cidade ou região…'), { key: 'Enter' })

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(CURITIBA_URL, expect.anything()))
  })

  test('busca com texto só de espaços não chama o backend e mostra orientação', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    render(<App />)

    typeCity('   ')
    clickSearch()

    expect(fetchMock).not.toHaveBeenCalled()
    expect(screen.getByText('Digite o nome de uma cidade ou região para pesquisar.')).toBeInTheDocument()
  })

  test('cidade não encontrada mostra a mensagem amigável sem botão de nova tentativa', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(404, { error: { code: 'CITY_NOT_FOUND', message: 'x' } })))
    render(<App />)

    typeCity('Xyzzy')
    clickSearch()

    expect(await screen.findByRole('alert')).toHaveTextContent(NOT_FOUND_MESSAGE)
    expect(screen.queryByRole('button', { name: RETRY_LABEL })).not.toBeInTheDocument()
  })

  test('falha de comunicação mostra "Tentar novamente", que repete a consulta', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(502, { error: { code: 'UPSTREAM_ERROR', message: 'x' } }))
      .mockResolvedValueOnce(jsonResponse(200, WEATHER_FIXTURE))
    vi.stubGlobal('fetch', fetchMock)
    render(<App />)

    typeCity('Curitiba')
    clickSearch()

    expect(await screen.findByRole('alert')).toHaveTextContent(NETWORK_MESSAGE)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: RETRY_LABEL }))
    })

    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[1][0]).toBe(CURITIBA_URL)
  })
})
