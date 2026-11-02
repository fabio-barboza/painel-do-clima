import React from 'react'
import { act, render } from '@testing-library/react'
import Header from '../components/Header.jsx'

describe('Header', () => {
  let observerCallback

  beforeEach(() => {
    class IntersectionObserverMock {
      constructor(callback) {
        observerCallback = callback
      }

      observe() {}

      unobserve() {}

      disconnect() {}
    }

    vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('renderiza header.top com revelação de atraso 0s', () => {
    const { container } = render(<Header />)
    const header = container.querySelector('header')

    expect(header).toHaveClass('top', 'reveal')
    expect(header).not.toHaveClass('in')
    expect(header.style.getPropertyValue('--d')).toBe('0s')
  })

  test('renderiza a marca com o ícone brand e os textos do arquivo', () => {
    const { container, getByRole, getByText } = render(<Header />)

    expect(container.querySelector('.brand-mark use')).toHaveAttribute('href', '#i-brand')
    expect(getByRole('heading', { level: 1 })).toHaveTextContent('Painel do Clima')
    expect(getByText('Tempo em tempo real')).toBeInTheDocument()
  })

  test('renderiza o relógio como filho de header', () => {
    const { container } = render(<Header />)

    expect(container.querySelector('header > .clock #clockTime')).toBeInTheDocument()
    expect(container.querySelector('header > .clock #clockDate')).toBeInTheDocument()
  })

  test('recebe a classe in ao interseccionar', () => {
    const { container } = render(<Header />)
    const header = container.querySelector('header')

    act(() => {
      observerCallback([{ isIntersecting: true, target: header }])
    })

    expect(header).toHaveClass('in')
  })
})
