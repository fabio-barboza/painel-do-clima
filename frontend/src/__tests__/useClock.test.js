import { describe, test, expect, afterEach, vi } from 'vitest'
import { act } from 'react'
import { renderHook } from '@testing-library/react'
import useClock from '../hooks/useClock.js'

const TIME_RE = /^\d{2}:\d{2}:\d{2}$/
const DATE_RE = /^.+?, \d{1,2} de .+$/

describe('useClock', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllTimers()
  })

  test('retorna time HH:MM:SS e date longa pt-BR', () => {
    const { result } = renderHook(() => useClock())
    expect(result.current.time).toMatch(TIME_RE)
    expect(result.current.date).toMatch(DATE_RE)
  })

  test('atualiza a cada 1 s (fake timers)', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-27T10:00:00'))
    const { result } = renderHook(() => useClock())
    expect(result.current.time).toBe('10:00:00')
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.time).toBe('10:00:01')
    expect(result.current.date).toMatch(DATE_RE)
  })

  test('limpa o interval ao desmontar', () => {
    vi.useFakeTimers()
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval')
    const { unmount } = renderHook(() => useClock())
    unmount()
    expect(clearIntervalSpy).toHaveBeenCalledTimes(1)
  })
})
