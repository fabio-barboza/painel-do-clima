import React from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import WeatherIcon from '../components/WeatherIcon.jsx'

const CATEGORIES = ['clear', 'partly', 'cloudy', 'fog', 'rain', 'snow', 'thunder']

describe('WeatherIcon', () => {
  it.each(CATEGORIES)('renderiza um SVG com aria-hidden="true" para a categoria %s', (category) => {
    const { container } = render(<WeatherIcon category={category} />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it.each(CATEGORIES)('renderiza conteúdo SVG não vazio para a categoria %s', (category) => {
    const { container } = render(<WeatherIcon category={category} />)
    const svg = container.querySelector('svg')
    expect(svg.querySelectorAll('*').length).toBeGreaterThan(0)
  })

  it('aplica a classe weather-icon ao SVG', () => {
    const { container } = render(<WeatherIcon category="clear" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('weather-icon')
  })

  it('usa o tamanho padrão de 48px', () => {
    const { container } = render(<WeatherIcon category="clear" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '48')
    expect(svg).toHaveAttribute('height', '48')
  })

  it('aceita um tamanho customizado via prop size', () => {
    const { container } = render(<WeatherIcon category="rain" size={64} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '64')
    expect(svg).toHaveAttribute('height', '64')
  })

  it('cada categoria renderiza SVGs distintos entre si', () => {
    const rendered = CATEGORIES.map((category) => {
      const { container } = render(<WeatherIcon category={category} />)
      return container.querySelector('svg').innerHTML
    })
    const unique = new Set(rendered)
    expect(unique.size).toBe(CATEGORIES.length)
  })

  it('usa CSS custom properties para cores (sem cor hardcoded)', () => {
    const { container } = render(<WeatherIcon category="clear" />)
    const svg = container.querySelector('svg')
    const html = svg.innerHTML
    expect(html).toContain('var(--wi-sun)')
    expect(html).not.toMatch(/fill="#[0-9a-fA-F]{3,6}"/)
  })

  it('renderiza um fallback para categoria desconhecida', () => {
    const { container } = render(<WeatherIcon category="unknown" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg.querySelectorAll('*').length).toBeGreaterThan(0)
  })
})
