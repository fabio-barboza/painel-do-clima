import React from 'react'
import { render, screen } from '@testing-library/react'
import EmptyState from '../components/EmptyState.jsx'

const EMPTY_TITLE = 'Consulte o clima'
const EMPTY_SUBTITLE = 'Pesquise uma cidade ou use sua localização atual para ver as condições do tempo.'

describe('EmptyState', () => {
  test('renderiza um card com card-head e o título do estado vazio', () => {
    const { container } = render(<EmptyState />)

    expect(container.querySelector('section')).toHaveClass('card')
    expect(container.querySelector('section .card-head')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: EMPTY_TITLE })).toBeInTheDocument()
  })

  test('mostra o subtítulo da TechSpec com a classe sub', () => {
    const { container } = render(<EmptyState />)

    expect(screen.getByText(EMPTY_SUBTITLE)).toHaveClass('sub')
    expect(container.querySelector('.card-head .sub')).toHaveTextContent(EMPTY_SUBTITLE)
  })

  test('aplica a revelação com atraso de .08s', () => {
    const { container } = render(<EmptyState />)
    const section = container.querySelector('section')

    expect(section).toHaveClass('reveal')
    expect(section).not.toHaveClass('in')
    expect(section.style.getPropertyValue('--d')).toBe('.08s')
  })
})
