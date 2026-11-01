import { describe, test, expect, afterEach, vi } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import App from '../App.jsx'

const TIME_RE = /^\d{2}:\d{2}:\d{2}$/

describe('Header + Clock', () => {
  afterEach(() => {
    vi.clearAllTimers()
  })

  test('estrutura da marca: ícone + h1 + small', () => {
    render(<Header />)
    expect(screen.getByRole('heading', { name: 'Painel do Clima' })).toBeInTheDocument()
    expect(screen.getByText('Tempo em tempo real')).toBeInTheDocument()
    expect(document.querySelector('.brand-mark .ico')).toBeTruthy()
  })

  test('relógio mostra hora HH:MM:SS e date pt-BR', () => {
    render(<Header />)
    const time = document.querySelector('.clock .time')
    const date = document.querySelector('.clock .date')
    expect(time).toBeTruthy()
    expect(date).toBeTruthy()
    expect(time.textContent).toMatch(TIME_RE)
    expect(date.textContent).toBeTruthy()
  })
})

describe('Footer', () => {
  test('texto não afirma "dados simulados"', () => {
    render(<Footer />)
    const footer = screen.getByRole('contentinfo')
    expect(footer.textContent).not.toContain('simulados')
    expect(footer.textContent).toContain('Painel do Clima')
  })
})

describe('App (montagem inicial)', () => {
  test('monta céu + cabeçalho + rodapé com data-tint=clear', () => {
    render(<App />)
    expect(document.querySelector('[data-tint="clear"]')).toBeTruthy()
    expect(document.querySelectorAll('#stars i')).toHaveLength(140)
    expect(document.querySelector('.moon')).toBeTruthy()
    expect(document.querySelectorAll('.bg-cloud')).toHaveLength(3)
    expect(document.querySelectorAll('.tint-layer')).toHaveLength(2)
    expect(document.querySelector('.dashboard')).toBeTruthy()
    expect(document.querySelector('.clock .time')).toBeTruthy()
    const footer = screen.getByRole('contentinfo')
    expect(footer.textContent).not.toContain('simulados')
  })
})
