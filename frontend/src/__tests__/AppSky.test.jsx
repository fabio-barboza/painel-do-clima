import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import App from '../App'
import { WEATHER_FIXTURE } from './fixtures/weather.js'

const SEARCH_PLACEHOLDER = 'Pesquisar cidade ou região…'
const SEARCH_BUTTON_ID = 'btnSearch'
const REFERENCE_SKY = 'reference'
const CLOUDY_SKY = 'cloudy'
const RAIN_SKY = 'rain'
const CLEAR_CODE = 0
const OVERCAST_CODE = 3
const RAIN_CODE = 61
const UNKNOWN_CODE = 4
const EMPTY_HEADING = 'Consulte o clima'

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

function weatherWithCode(code) {
  return { ...WEATHER_FIXTURE, current: { ...WEATHER_FIXTURE.current, weather_code: code } }
}

function typeCity(text) {
  fireEvent.change(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), { target: { value: text } })
}

function clickSearch() {
  fireEvent.click(document.getElementById(SEARCH_BUTTON_ID))
}

function readSky() {
  return document.querySelector('.sky').getAttribute('data-sky')
}

async function searchWithResponse(response) {
  render(<App />)
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))
  typeCity('Curitiba')
  clickSearch()
  await waitFor(() => expect(screen.queryByRole('heading', { name: EMPTY_HEADING })).not.toBeInTheDocument())
}

describe('App com a variante de fundo', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('estado vazio mantém a variante reference', () => {
    render(<App />)

    expect(readSky()).toBe(REFERENCE_SKY)
    expect(document.querySelector('.sky-layer.is-active')).toBeNull()
  })

  test('céu limpo aplica reference', async () => {
    await searchWithResponse(jsonResponse(200, weatherWithCode(CLEAR_CODE)))

    expect(readSky()).toBe(REFERENCE_SKY)
  })

  test('encoberto aplica cloudy e ativa somente a camada cinza', async () => {
    render(<App />)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, weatherWithCode(OVERCAST_CODE))))
    typeCity('Curitiba')
    clickSearch()

    await waitFor(() => expect(readSky()).toBe(CLOUDY_SKY))
    expect(document.querySelector('.sky-cloudy')).toHaveClass('is-active')
    expect(document.querySelector('.sky-rain')).not.toHaveClass('is-active')
  })

  test('chuva aplica rain e ativa somente a camada escura', async () => {
    render(<App />)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, weatherWithCode(RAIN_CODE))))
    typeCity('Curitiba')
    clickSearch()

    await waitFor(() => expect(readSky()).toBe(RAIN_SKY))
    expect(document.querySelector('.sky-rain')).toHaveClass('is-active')
    expect(document.querySelector('.sky-cloudy')).not.toHaveClass('is-active')
  })

  test('código desconhecido aplica reference', async () => {
    await searchWithResponse(jsonResponse(200, weatherWithCode(UNKNOWN_CODE)))

    expect(readSky()).toBe(REFERENCE_SKY)
  })

  test('falha após uma consulta bem-sucedida mantém a variante da última consulta', async () => {
    render(<App />)
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse(200, weatherWithCode(RAIN_CODE)))
        .mockResolvedValueOnce(jsonResponse(502, { error: { code: 'UPSTREAM_ERROR', message: 'x' } })),
    )
    typeCity('Curitiba')
    clickSearch()
    await waitFor(() => expect(readSky()).toBe(RAIN_SKY))

    clickSearch()

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(readSky()).toBe(RAIN_SKY)
  })
})
