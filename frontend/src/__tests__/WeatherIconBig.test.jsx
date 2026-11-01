import { describe, test, expect } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'
import WeatherIconBig from '../components/WeatherIconBig.jsx'

// Condições que antes ficavam estáticas (sem animação) no ícone grande:
// cloud (3), rain (63), storm (95) — conforme BUG-01.
const STATIC_BEFORE_FIX = [
  { code: 3, label: 'nublado' },
  { code: 63, label: 'chuva' },
  { code: 95, label: 'tempestade' },
]

describe('WeatherIconBig — animação do ícone grande (BUG-01)', () => {
  STATIC_BEFORE_FIX.forEach(({ code, label }) => {
    test(`BugFix #BUG-01: ícone ${label} (code ${code}) anima com bi-float`, () => {
      const { container } = render(<WeatherIconBig code={code} />)
      const svg = container.querySelector('svg.bi-big')

      expect(svg).toBeTruthy()
      // Antes da correção, a classe bi-float (que reaproita floaty) não existia:
      // o ícone ficava 100% estático. A regressão exige a classe presente.
      expect(svg.getAttribute('class')).toContain('bi-float')
    })
  })

  test('edge case: sol (code 0) NÃO recebe bi-float (só gira no rotor)', () => {
    const { container } = render(<WeatherIconBig code={0} />)
    const svg = container.querySelector('svg')
    expect(svg.getAttribute('class')).not.toContain('bi-float')
    expect(svg.classList.contains('bi-sun')).toBe(true)
  })

  test('edge case: cloud-sun (code 2) NÃO recebe bi-float', () => {
    const { container } = render(<WeatherIconBig code={2} />)
    const svgBig = container.querySelector('svg.bi-big')
    expect(svgBig).toBeNull()
    const anySvg = container.querySelector('svg')
    expect(anySvg.getAttribute('class')).not.toContain('bi-float')
  })
})
