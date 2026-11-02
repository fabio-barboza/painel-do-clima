import React from 'react'
import { act, render } from '@testing-library/react'
import useReveal from '../hooks/useReveal.js'

function RevealProbe() {
  const [ref, revealed] = useReveal()
  return <div ref={ref} data-testid="probe" data-revealed={String(revealed)} />
}

describe('useReveal', () => {
  let observerCallback
  let observe
  let unobserve
  let disconnect

  beforeEach(() => {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()

    class IntersectionObserverMock {
      constructor(callback, options) {
        observerCallback = callback
        this.options = options
      }

      observe(element) {
        observe(element)
      }

      unobserve(element) {
        unobserve(element)
      }

      disconnect() {
        disconnect()
      }
    }

    vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('observa o elemento com threshold 0.15 e começa sem revelar', () => {
    const { getByTestId } = render(<RevealProbe />)

    expect(observe).toHaveBeenCalledWith(getByTestId('probe'))
    expect(getByTestId('probe')).toHaveAttribute('data-revealed', 'false')
  })

  test('não revela enquanto o elemento não intersecciona', () => {
    const { getByTestId } = render(<RevealProbe />)

    act(() => {
      observerCallback([{ isIntersecting: false, target: getByTestId('probe') }])
    })

    expect(getByTestId('probe')).toHaveAttribute('data-revealed', 'false')
    expect(unobserve).not.toHaveBeenCalled()
  })

  test('revela ao interseccionar e deixa de observar o elemento', () => {
    const { getByTestId } = render(<RevealProbe />)
    const probe = getByTestId('probe')

    act(() => {
      observerCallback([{ isIntersecting: true, target: probe }])
    })

    expect(getByTestId('probe')).toHaveAttribute('data-revealed', 'true')
    expect(unobserve).toHaveBeenCalledWith(probe)
  })

  test('desconecta o observador no cleanup', () => {
    const { unmount } = render(<RevealProbe />)

    unmount()

    expect(disconnect).toHaveBeenCalledTimes(1)
  })
})
