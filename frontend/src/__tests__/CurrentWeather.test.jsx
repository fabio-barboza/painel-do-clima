import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CurrentWeather from '../components/CurrentWeather.jsx'

const baseCurrent = {
  temperature: 18.3,
  humidity: 72,
  windSpeed: 11.4,
  uvIndex: 5.5,
  precipitation: 0.5,
  weatherCode: 2,
}

function renderCurrentWeather(current = baseCurrent) {
  const { container } = render(<CurrentWeather current={current} />)
  return { container }
}

describe('CurrentWeather', () => {
  it('renderiza a temperatura em °C', () => {
    renderCurrentWeather()
    expect(screen.getByText('18,3 °C')).toBeInTheDocument()
  })

  it('renderiza a umidade em %', () => {
    renderCurrentWeather()
    expect(screen.getByText('72%')).toBeInTheDocument()
  })

  it('renderiza a velocidade do vento em km/h', () => {
    renderCurrentWeather()
    expect(screen.getByText('11,4 km/h')).toBeInTheDocument()
  })

  it('renderiza a precipitação em mm', () => {
    renderCurrentWeather()
    expect(screen.getByText('0,5 mm')).toBeInTheDocument()
  })

  it('renderiza a barra UV', () => {
    const { container } = renderCurrentWeather()
    expect(container.querySelector('.uv-bar')).toBeInTheDocument()
    expect(container.querySelector('.uv-bar')).toHaveAttribute('role', 'meter')
  })

  it('renderiza o label do clima em PT-BR', () => {
    renderCurrentWeather()
    expect(screen.getByText('Parcialmente nublado')).toBeInTheDocument()
  })

  it('renderiza o ícone animado por categoria', () => {
    const { container } = renderCurrentWeather()
    const icon = container.querySelector('.weather-icon')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })

  it('expõe rótulos acessíveis para cada métrica', () => {
    renderCurrentWeather()
    expect(screen.getByText('Umidade')).toBeInTheDocument()
    expect(screen.getByText('Vento')).toBeInTheDocument()
    expect(screen.getByText('Precipitação')).toBeInTheDocument()
    expect(screen.getByText('Índice UV')).toBeInTheDocument()
  })

  it('troca o label e a categoria para o código de chuva', () => {
    renderCurrentWeather({ ...baseCurrent, weatherCode: 61 })
    expect(screen.getByText('Chuva fraca')).toBeInTheDocument()
  })
})
