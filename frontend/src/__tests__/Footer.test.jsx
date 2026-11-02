import React from 'react'
import { act, render } from '@testing-library/react'
import Footer from '../components/Footer.jsx'

describe('Footer', () => {
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

  test('renderiza footer.reveal com revelação de atraso .4s', () => {
    const { container } = render(<Footer />)
    const footer = container.querySelector('footer')

    expect(footer).toHaveClass('reveal')
    expect(footer).not.toHaveClass('in')
    expect(footer.style.getPropertyValue('--d')).toBe('.4s')
  })

  test('exibe o nome do painel em negrito e a atribuição à Open-Meteo', () => {
    const { container, getByRole } = render(<Footer />)

    expect(container.querySelector('footer b')).toHaveTextContent('Painel do Clima')
    expect(container.querySelector('footer')).toHaveTextContent(
      'Painel do Clima · dados meteorológicos por Open-Meteo.com',
    )
    expect(getByRole('link', { name: 'Open-Meteo.com' })).toHaveAttribute(
      'href',
      'https://open-meteo.com/',
    )
  })

  test('não exibe o texto de demonstração do arquivo de referência', () => {
    const { container } = render(<Footer />)

    expect(container.querySelector('footer')).not.toHaveTextContent('dados simulados')
  })

  test('recebe a classe in ao interseccionar', () => {
    const { container } = render(<Footer />)
    const footer = container.querySelector('footer')

    act(() => {
      observerCallback([{ isIntersecting: true, target: footer }])
    })

    expect(footer).toHaveClass('in')
  })
})
