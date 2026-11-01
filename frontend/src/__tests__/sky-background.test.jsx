import { describe, test, expect } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'
import SkyBackground from '../components/SkyBackground.jsx'

function styles(el) {
  return Array.from(el).map(node => node.getAttribute('style'))
}

describe('SkyBackground', () => {
  test('renderiza 140 estrelas no #stars', () => {
    render(<SkyBackground tint="clear" />)
    expect(document.querySelectorAll('#stars i')).toHaveLength(140)
  })

  test('renderiza a lua', () => {
    render(<SkyBackground />)
    expect(document.querySelector('.moon')).toBeTruthy()
  })

  test('renderiza 3 nuvens com os inline styles exatos', () => {
    render(<SkyBackground />)
    const clouds = document.querySelectorAll('.bg-cloud')
    expect(clouds).toHaveLength(3)
    const s = styles(clouds)

    expect(s[0]).toContain('top: 14%')
    expect(s[0]).toContain('width: 420px')
    expect(s[0]).toContain('height: 110px')
    expect(s[0]).toContain('animation-duration: 100s')
    expect(s[0]).toContain('animation-delay: -20s')

    expect(s[1]).toContain('top: 42%')
    expect(s[1]).toContain('width: 540px')
    expect(s[1]).toContain('height: 130px')
    expect(s[1]).toContain('animation-duration: 150s')
    expect(s[1]).toContain('animation-delay: -80s')

    expect(s[2]).toContain('top: 68%')
    expect(s[2]).toContain('width: 380px')
    expect(s[2]).toContain('height: 100px')
    expect(s[2]).toContain('animation-duration: 120s')
    expect(s[2]).toContain('animation-delay: -45s')
  })

  test('renderiza 2 estrelas cadentes (incluindo .shoot2)', () => {
    render(<SkyBackground />)
    expect(document.querySelectorAll('.shoot')).toHaveLength(2)
    expect(document.querySelector('.shoot2')).toBeTruthy()
  })

  test('renderiza 2 camadas de tint (cloudy e rain)', () => {
    render(<SkyBackground />)
    expect(document.querySelectorAll('.tint-layer')).toHaveLength(2)
    expect(document.querySelector('.tint-layer[data-tint="cloudy"]')).toBeTruthy()
    expect(document.querySelector('.tint-layer[data-tint="rain"]')).toBeTruthy()
  })

  test('data-tint do wrapper reflete a prop tint', () => {
    const { rerender } = render(<SkyBackground tint="rain" />)
    expect(document.querySelector('[data-tint]').getAttribute('data-tint')).toBe('rain')
    rerender(<SkyBackground tint="cloudy" />)
    expect(document.querySelector('[data-tint]').getAttribute('data-tint')).toBe('cloudy')
    rerender(<SkyBackground tint="clear" />)
    expect(document.querySelector('[data-tint]').getAttribute('data-tint')).toBe('clear')
  })
})
