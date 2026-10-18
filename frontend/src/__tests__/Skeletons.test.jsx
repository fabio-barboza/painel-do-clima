import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Skeletons from '../components/Skeletons.jsx'

describe('Skeletons', () => {
  it('anuncia o carregamento para leitores de tela', () => {
    render(<Skeletons />)
    expect(screen.getByRole('status', { name: 'Carregando dados do clima' })).toBeInTheDocument()
  })

  it('renderiza o skeleton dos três cards (atuais, gráfico e semana)', () => {
    const { container } = render(<Skeletons />)
    expect(container.querySelectorAll('.skeletons .card')).toHaveLength(3)
  })

  it('renderiza o skeleton do gráfico como bloco', () => {
    const { container } = render(<Skeletons />)
    expect(container.querySelector('.skeleton-block')).toBeInTheDocument()
  })

  it('renderiza heading de card e linhas de texto como skeletons', () => {
    const { container } = render(<Skeletons />)
    expect(container.querySelectorAll('.skeleton-heading')).toHaveLength(3)
    expect(container.querySelectorAll('.skeleton-text')).toHaveLength(5)
  })

  it('o skeleton substitui todo o conteúdo dos cards', () => {
    const { container } = render(<Skeletons />)
    const cards = [...container.querySelectorAll('.card')]
    expect(cards).toHaveLength(3)
    for (const card of cards) {
      const children = [...card.children]
      expect(children.length).toBeGreaterThan(0)
      for (const child of children) {
        expect(child.classList.contains('skeleton')).toBe(true)
      }
    }
  })
})
