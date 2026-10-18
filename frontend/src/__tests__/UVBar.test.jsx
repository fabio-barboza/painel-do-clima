import React from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import UVBar from '../components/UVBar.jsx'

function renderBar(value) {
  const { container } = render(<UVBar value={value} />)
  return {
    bar: container.querySelector('.uv-bar'),
    marker: container.querySelector('.uv-bar-marker'),
  }
}

describe('UVBar', () => {
  it('posiciona o marcador proporcionalmente ao valor (50% para 5,5 em escala 0–11)', () => {
    const { marker } = renderBar(5.5)
    expect(marker).toHaveStyle({ left: '50%' })
  })

  it('posiciona o marcador em 0% para o valor mínimo', () => {
    const { marker } = renderBar(0)
    expect(marker).toHaveStyle({ left: '0%' })
  })

  it('posiciona o marcador em 100% para o valor máximo da escala', () => {
    const { marker } = renderBar(11)
    expect(marker).toHaveStyle({ left: '100%' })
  })

  it('limita valores acima do máximo da escala em 100%', () => {
    const { marker } = renderBar(20)
    expect(marker).toHaveStyle({ left: '100%' })
  })

  it('exibe o papel meter e os atributos de valor acessíveis', () => {
    const { bar } = renderBar(5.5)
    expect(bar).toHaveAttribute('role', 'meter')
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '11')
    expect(bar).toHaveAttribute('aria-valuenow', '5.5')
  })

  it('exibe um aria-label legível com o valor e a escala', () => {
    const { bar } = renderBar(5.5)
    const label = bar.getAttribute('aria-label')
    expect(label).toMatch(/5,5/)
    expect(label).toMatch(/0 a 11/)
  })

  it('informa quando o índice UV está indisponível', () => {
    const { bar, marker } = renderBar(null)
    expect(bar).toHaveAttribute('role', 'status')
    expect(bar).not.toHaveAttribute('aria-valuenow')
    expect(bar.getAttribute('aria-label')).toMatch(/indisponível/i)
    expect(bar.querySelector('.visually-hidden')).toHaveTextContent(/indisponível/i)
    expect(marker).toHaveStyle({ left: '0%' })
  })
})
