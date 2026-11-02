import { act, renderHook } from '@testing-library/react'
import useCountUp from '../hooks/useCountUp.js'

const DELAY_MS = 450
const DURATION_MS = 1400
const FAKE_TIMERS = ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame', 'performance']

function mockReducedMotion(matches) {
  vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
    matches,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false
    },
  }))
}

describe('useCountUp com movimento normal', () => {
  beforeEach(() => {
    mockReducedMotion(false)
    vi.useFakeTimers({ toFake: FAKE_TIMERS })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  test('permanece em zero antes do atraso de 450 ms', () => {
    const { result } = renderHook(() => useCountUp(20))

    act(() => {
      vi.advanceTimersByTime(DELAY_MS - 1)
    })

    expect(result.current).toBe(0)
  })

  test('avança em direção ao alvo depois do atraso', () => {
    const { result } = renderHook(() => useCountUp(20))

    act(() => {
      vi.advanceTimersByTime(DELAY_MS + DURATION_MS / 2)
    })

    expect(result.current).toBeGreaterThan(0)
    expect(result.current).toBeLessThan(20)
  })

  test('termina exatamente no valor alvo ao fim da duração', () => {
    const { result } = renderHook(() => useCountUp(26))

    act(() => {
      vi.advanceTimersByTime(DELAY_MS + DURATION_MS + 100)
    })

    expect(result.current).toBe(26)
  })

  test('termina no valor negativo', () => {
    const { result } = renderHook(() => useCountUp(-4))

    act(() => {
      vi.advanceTimersByTime(DELAY_MS + DURATION_MS + 100)
    })

    expect(result.current).toBe(-4)
  })

  test('cancela os temporizadores ao desmontar sem erro', () => {
    const { unmount } = renderHook(() => useCountUp(12))

    expect(() => {
      unmount()
      vi.advanceTimersByTime(DELAY_MS + DURATION_MS)
    }).not.toThrow()
  })
})

describe('useCountUp com movimento reduzido', () => {
  beforeEach(() => {
    mockReducedMotion(true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('devolve o valor final direto, sem contagem', () => {
    const { result } = renderHook(() => useCountUp(18))

    expect(result.current).toBe(18)
  })

  test('acompanha um novo alvo sem atraso', () => {
    const { result, rerender } = renderHook(({ target }) => useCountUp(target), {
      initialProps: { target: 5 },
    })

    rerender({ target: -7 })

    expect(result.current).toBe(-7)
  })
})
