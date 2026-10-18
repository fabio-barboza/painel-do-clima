import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import SearchBar from '../components/SearchBar.jsx'

function renderSearchBar(props = {}) {
  const onSearch = vi.fn()
  const onLocate = vi.fn()
  const view = render(<SearchBar onSearch={onSearch} onLocate={onLocate} {...props} />)
  return { onSearch, onLocate, ...view }
}

function getForm() {
  return screen.getByRole('textbox', { name: 'Cidade' }).closest('form')
}

describe('SearchBar', () => {
  it('renderiza o campo de texto com label associada e o botão de busca', () => {
    renderSearchBar()
    const input = screen.getByRole('textbox', { name: 'Cidade' })
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'text')
    expect(input).toHaveAttribute('id', 'search-bar-city')
    expect(screen.getByLabelText('Cidade')).toBe(input)
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeInTheDocument()
  })

  it('submeter o formulário com uma cidade invoca onSearch com o nome digitado', () => {
    const { onSearch } = renderSearchBar()
    fireEvent.change(screen.getByRole('textbox', { name: 'Cidade' }), {
      target: { value: 'São Paulo' },
    })
    fireEvent.submit(getForm())
    expect(onSearch).toHaveBeenCalledTimes(1)
    expect(onSearch).toHaveBeenCalledWith('São Paulo')
  })

  it('submeter com espaços nas pontas envia a cidade aparada', () => {
    const { onSearch } = renderSearchBar()
    fireEvent.change(screen.getByRole('textbox', { name: 'Cidade' }), {
      target: { value: '  Curitiba  ' },
    })
    fireEvent.submit(getForm())
    expect(onSearch).toHaveBeenCalledWith('Curitiba')
  })

  it('clicar no botão de busca invoca onSearch com a cidade', () => {
    const { onSearch } = renderSearchBar()
    fireEvent.change(screen.getByRole('textbox', { name: 'Cidade' }), {
      target: { value: 'Florianópolis' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }))
    expect(onSearch).toHaveBeenCalledTimes(1)
    expect(onSearch).toHaveBeenCalledWith('Florianópolis')
  })

  it('campo vazio não dispara a busca', () => {
    const { onSearch } = renderSearchBar()
    fireEvent.submit(getForm())
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('campo com apenas espaços não dispara a busca', () => {
    const { onSearch } = renderSearchBar()
    fireEvent.change(screen.getByRole('textbox', { name: 'Cidade' }), {
      target: { value: '   ' },
    })
    fireEvent.submit(getForm())
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('loading=true desabilita o campo e o botão e exibe feedback de carregamento', () => {
    renderSearchBar({ loading: true })
    expect(screen.getByRole('textbox', { name: 'Cidade' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Buscando…' })).toBeDisabled()
  })

  it('sem loading o botão permanece habilitado com o rótulo de busca', () => {
    renderSearchBar()
    expect(screen.getByRole('textbox', { name: 'Cidade' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeEnabled()
  })

  it('o formulário sinaliza aria-busy durante o carregamento', () => {
    renderSearchBar({ loading: true })
    expect(getForm()).toHaveAttribute('aria-busy', 'true')
  })

  it('sem loading o formulário não sinaliza aria-busy', () => {
    renderSearchBar()
    expect(getForm()).toHaveAttribute('aria-busy', 'false')
  })

  it('renderiza o botão de geolocalização acessível com ícone', () => {
    renderSearchBar()
    const button = screen.getByRole('button', { name: 'Usar minha localização' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('type', 'button')
    expect(button.querySelector('svg')).toBeInTheDocument()
  })

  it('clicar no botão de geolocalização invoca onLocate uma única vez', () => {
    const { onLocate } = renderSearchBar()
    fireEvent.click(screen.getByRole('button', { name: 'Usar minha localização' }))
    expect(onLocate).toHaveBeenCalledTimes(1)
  })

  it('loading=true desabilita o botão de geolocalização', () => {
    renderSearchBar({ loading: true })
    expect(screen.getByRole('button', { name: 'Usar minha localização' })).toBeDisabled()
  })

  it('sem loading o botão de geolocalização permanece habilitado', () => {
    renderSearchBar()
    expect(screen.getByRole('button', { name: 'Usar minha localização' })).toBeEnabled()
  })
})
