import React from 'react'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  test('renders app component', () => {
    render(<App />)
    
    // Verifica se o componente foi renderizado sem erros
    expect(App).toBeDefined()
  })
})
