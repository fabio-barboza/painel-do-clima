import React from 'react'
import { render } from '@testing-library/react'
import Icon from '../components/Icon.jsx'

describe('Icon', () => {
  test('gera svg.ico com use apontando para o símbolo do sprite', () => {
    const { container } = render(<Icon name="brand" />)
    const svg = container.querySelector('svg.ico')

    expect(svg).toBeInTheDocument()
    expect(svg.querySelector('use')).toHaveAttribute('href', '#i-brand')
  })

  test('usa o nome recebido para montar o href', () => {
    const { container } = render(<Icon name="sun" />)

    expect(container.querySelector('use')).toHaveAttribute('href', '#i-sun')
  })
})
