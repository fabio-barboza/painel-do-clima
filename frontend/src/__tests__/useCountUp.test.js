import { describe, test, expect, afterEach, vi } from 'vitest'
import { act } from 'react'
import { renderHook } from '@testing-library/react'
import useCountUp from '../hooks/useCountUp.js'

describe('useCountUp', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  test('anima de 0 até o target em 1400 ms e termina exatamente no valor', () => {
    vi.useFakeTimers()
    const { result, unmount } = renderHook(() => useCountUp(32))

    expect(result.current).toBe(0)

    act(() => {
      vi.advanceTimersByTime(450) // delay: ainda não começou a animar
    })
    expect(result.current).toBe(0)

    act(() => {
      vi.advanceTimersByTime(1400)
    })
    expect(result.current).toBe(32)

    unmount()
  })

  test('desenha um valor intermediário dentro da animação', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useCountUp(100))

    act(() => {
      vi.advanceTimersByTime(450)
    })
    act(() => {
      vi.advanceTimersByTime(700) // metade do período
    })
    // easing cúbico: progress 0.5 → ~0.875 → 87, ainda < 100
    expect(result.current).toBeGreaterThan(0)
    expect(result.current).toBeLessThan(100)

    act(() => {
      vi.advanceTimersByTime(700)
    })
    expect(result.current).toBe(100)
  })

  test('prefers-reduced-motion → valor direto (sem animação de contagem)', () => {
    vi.useFakeTimers()
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })))
    const { result } = renderHook(() => useCountUp(27))

    expect(result.current).toBe(0)
    act(() => {
      vi.advanceTimersByTime(450)
    })
    expect(result.current).toBe(27)
  })

  test('cancela o requestAnimationFrame no cleanup quando desmonta durante a animação', () => {
    vi.useFakeTimers()
    const cancelSpy = vi.spyOn(globalThis, 'cancelAnimationFrame')
    const { result, unmount } = renderHook(() => useCountUp(32))

    act(() => {
      vi.advanceTimersByTime(450) // delay → começa a animação
    })
    act(() => {
      vi.advanceTimersByTime(700) // metade do período: animação em curso
    })
    expect(result.current).toBeGreaterThan(0)
    expect(result.current).toBeLessThan(32)

    unmount()

    // O rAF foi cancelado no cleanup em vez de rodar ~1,4 s chamando setValue em hook desmontado
    expect(cancelSpy).toHaveBeenCalled()
  })

  test('reanima quando o target muda', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ target }) => useCountUp(target), {
      initialProps: { target: 10 },
    })

    act(() => {
      vi.advanceTimersByTime(450 + 1400)
    })
    expect(result.current).toBe(10)

    act(() => {
      rerender({ target: 40 })
    })
    act(() => {
      vi.advanceTimersByTime(450 + 1400)
    })
    expect(result.current).toBe(40)
  })
})
