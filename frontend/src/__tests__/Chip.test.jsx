import React from 'react'
import { render, screen } from '@testing-library/react'
import Chip from '../components/Chip.jsx'

describe('Chip', () => {
  test('usa o tom plain por padrão e não mostra ícone', () => {
    const { container } = render(<Chip>Sensação <b>28°</b></Chip>)

    const chip = container.querySelector('span.chip')
    expect(chip).toHaveClass('plain')
    expect(chip.querySelector('svg')).not.toBeInTheDocument()
    expect(chip).toHaveTextContent('Sensação 28°')
  })

  test('aplica o tom e o ícone pedidos, com espaço após o ícone', () => {
    const { container } = render(<Chip tone="hot" icon="up">Máx <b>26°</b></Chip>)

    const chip = container.querySelector('span.chip')
    expect(chip).toHaveClass('hot')
    expect(chip.querySelector('svg.ico use')).toHaveAttribute('href', '#i-up')
    expect(chip.textContent).toBe(' Máx 26°')
    expect(screen.getByText('26°').tagName).toBe('B')
  })
})
