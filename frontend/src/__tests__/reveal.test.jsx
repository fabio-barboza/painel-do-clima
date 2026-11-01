import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, act } from '@testing-library/react'
import React, { StrictMode, useRef } from 'react'
import Reveal from '../components/Reveal.jsx'
import useReveal from '../hooks/useReveal.js'

class MockIntersectionObserver {
  static instances = []
  constructor(callback, options) {
    this.callback = callback
    this.options = options
    this.observed = []
    this.unobserved = []
    this.disconnected = false
    MockIntersectionObserver.instances.push(this)
  }
  observe(el) { this.observed.push(el) }
  unobserve(el) {
    this.unobserved.push(el)
    this.observed = this.observed.filter(e => e !== el)
  }
  disconnect() { this.disconnected = true }
  fireIntersecting(el) {
    if (!this.observed.includes(el)) return
    this.callback([{ isIntersecting: true, target: el }])
  }
}

beforeEach(() => {
  MockIntersectionObserver.instances = []
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Reveal', () => {
  test('aplica --d inline com o delay passado', () => {
    const { container } = render(<Reveal delay=".06s">conteúdo</Reveal>)
    const el = container.firstElementChild
    expect(el.classList.contains('reveal')).toBe(true)
    expect(el.classList.contains('in')).toBe(false)
    expect(el.style.getPropertyValue('--d')).toBe('.06s')
  })

  test('instant aplica .in sem depender do IntersectionObserver', () => {
    const { container } = render(<Reveal instant>esqueleto</Reveal>)
    const el = container.firstElementChild
    expect(el.classList.contains('in')).toBe(true)
    // nenhum observer deve ter sido criado para o modo instant
    expect(MockIntersectionObserver.instances).toHaveLength(0)
  })

  test('passa className adicional preservando reveal/in', () => {
    const { container } = render(<Reveal className="extra">x</Reveal>)
    const el = container.firstElementChild
    expect(el.className).toContain('reveal')
    expect(el.className).toContain('extra')
  })

  test('modo normal liga o IntersectionObserver no próprio div', () => {
    render(<Reveal delay=".06s">conteúdo</Reveal>)
    // ref foi anexado ao div, então o hook criou um observer
    expect(MockIntersectionObserver.instances).toHaveLength(1)
  })
})

describe('useReveal', () => {
  const Harness = () => {
    const ref = useRef(null)
    useReveal(ref)
    return <div ref={ref} className="reveal" data-ready />
  }

  test('threshold 0.15 e adiciona .in ao intersectar', () => {
    const { container } = render(<Harness />)
    const el = container.firstElementChild
    const instance = MockIntersectionObserver.instances[0]

    expect(instance).toBeTruthy()
    expect(instance.options.threshold).toBe(0.15)

    act(() => instance.fireIntersecting(el))
    expect(el.classList.contains('in')).toBe(true)
  })

  test('one-shot: unobserve é chamado após .in e nova interseção não esconde de novo', () => {
    const { container } = render(<Harness />)
    const el = container.firstElementChild
    const instance = MockIntersectionObserver.instances[0]

    act(() => instance.fireIntersecting(el))
    expect(instance.unobserved).toContain(el)

    act(() => instance.fireIntersecting(el))
    expect(el.classList.contains('in')).toBe(true)
  })

  test('cleanup no unmount desliga o observer', () => {
    const { unmount } = render(<Harness />)
    const instance = MockIntersectionObserver.instances[0]
    expect(instance.disconnected).toBe(false)

    act(() => unmount())
    expect(instance.disconnected).toBe(true)
  })

  test('StrictMode: duplo mount mantém um observer ativo e unobserve funciona', () => {
    const HarnessStrict = () => {
      const ref = useRef(null)
      useReveal(ref)
      return <div ref={ref} className="reveal" />
    }
    const { container } = render(
      <StrictMode><HarnessStrict /></StrictMode>
    )
    const el = container.firstElementChild

    const live = MockIntersectionObserver.instances.filter(i => !i.disconnected)
    expect(live).toHaveLength(1)

    act(() => live[0].fireIntersecting(el))
    expect(el.classList.contains('in')).toBe(true)
    expect(live[0].unobserved).toContain(el)
  })
})
