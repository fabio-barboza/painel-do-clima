import React from 'react'
import { act, render } from '@testing-library/react'
import Clock from '../components/Clock.jsx'

describe('Clock', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 10, 2, 9, 5, 7))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  test('mostra hora e data locais em pt-BR', () => {
    const { container } = render(<Clock />)

    expect(container.querySelector('#clockTime')).toHaveTextContent('09:05:07')
    expect(container.querySelector('#clockDate')).toHaveTextContent(/2 de novembro/)
  })

  test('atualiza a hora a cada segundo', () => {
    const { container } = render(<Clock />)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(container.querySelector('#clockTime')).toHaveTextContent('09:05:08')
  })

  test('limpa o intervalo ao desmontar', () => {
    const clearSpy = vi.spyOn(globalThis, 'clearInterval')
    const { unmount } = render(<Clock />)

    unmount()

    expect(clearSpy).toHaveBeenCalledTimes(1)
  })
})
