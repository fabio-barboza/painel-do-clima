import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import App from '../App'
import { WEATHER_FIXTURE } from './fixtures/weather.js'

const SEARCH_PLACEHOLDER = 'Pesquisar cidade ou região…'
const RETRY_LABEL = 'Tentar novamente'
const NETWORK_MESSAGE = 'Não foi possível obter os dados do clima agora.'

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

function failure() {
  return jsonResponse(502, { error: { code: 'UPSTREAM_ERROR', message: 'x' } })
}

function searchFor(text) {
  fireEvent.change(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), { target: { value: text } })
  fireEvent.click(document.getElementById('btnSearch'))
}

async function failFirstSearch() {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(failure()))
  searchFor('Curitiba')
  return screen.findByRole('alert')
}

describe('foco após "Tentar novamente"', () => {
  test('BugFix BUG-03: should keep focus on the retry button when the retry fails again', async () => {
    render(<App />)
    await failFirstSearch()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(failure()))

    const retryButton = screen.getByRole('button', { name: RETRY_LABEL })
    retryButton.focus()
    await act(async () => {
      fireEvent.click(retryButton)
    })

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(NETWORK_MESSAGE))
    expect(screen.getByRole('button', { name: RETRY_LABEL })).toHaveFocus()
    expect(document.activeElement).not.toBe(document.body)
  })

  test('BugFix BUG-03: should not move focus to the retry button when a new search fails', async () => {
    render(<App />)
    await failFirstSearch()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(failure()).mockResolvedValue(failure()))

    const retryButton = screen.getByRole('button', { name: RETRY_LABEL })
    retryButton.focus()
    await act(async () => {
      fireEvent.click(retryButton)
    })
    await waitFor(() => expect(screen.getByRole('button', { name: RETRY_LABEL })).toHaveFocus())

    const searchInput = screen.getByPlaceholderText(SEARCH_PLACEHOLDER)
    searchInput.focus()
    await act(async () => {
      searchFor('Londrina')
    })

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(NETWORK_MESSAGE))
    expect(screen.getByRole('button', { name: RETRY_LABEL })).not.toHaveFocus()
  })
})
