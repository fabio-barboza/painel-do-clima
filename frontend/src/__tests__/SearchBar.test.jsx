import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import SearchBar from '../components/SearchBar.jsx'

const IDLE_STATUS = 'idle'
const LOADING_STATUS = 'loading'
const SEARCH_BUSY = 'search'
const LOCATE_BUSY = 'locate'

function renderSearchBar(overrides = {}) {
  const props = {
    status: IDLE_STATUS,
    busy: null,
    onSearch: vi.fn(),
    onLocate: vi.fn(),
    ...overrides,
  }
  const view = render(<SearchBar {...props} />)
  return { ...view, props }
}

describe('SearchBar', () => {
  test('mantém a estrutura de painel.html com role search e ids', () => {
    const { container } = renderSearchBar()

    expect(container.querySelector('.search')).toHaveAttribute('role', 'search')
    expect(container.querySelector('.search')).toHaveStyle({ '--d': '.06s' })
    expect(container.querySelector('.search-ico use')).toHaveAttribute('href', '#i-search')
    expect(container.querySelector('#searchInput')).toBeInTheDocument()
    expect(container.querySelector('#btnSearch')).toHaveClass('btn', 'btn-primary')
    expect(container.querySelector('#btnLocate')).toHaveClass('btn', 'btn-ghost')
    expect(container.querySelector('#btnLocate use')).toHaveAttribute('href', '#i-gps')
  })

  test('usa o placeholder e o aria-label do arquivo, sem autocomplete', () => {
    renderSearchBar()
    const input = screen.getByRole('textbox', { name: 'Pesquisar cidade ou região' })

    expect(input).toHaveAttribute('placeholder', 'Pesquisar cidade ou região…')
    expect(input).not.toHaveAttribute('list')
    expect(input).toHaveAttribute('type', 'text')
  })

  test('mostra os textos fixos dos botões', () => {
    renderSearchBar()

    expect(screen.getByRole('button', { name: 'Pesquisar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Localização Atual' })).toBeInTheDocument()
    expect(screen.getByTitle('Usar minha localização')).toBe(screen.getByRole('button', { name: 'Localização Atual' }))
  })

  test('dispara onSearch com o texto digitado ao clicar em Pesquisar', () => {
    const { props } = renderSearchBar()
    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: 'Curitiba' } })
    fireEvent.click(screen.getByRole('button', { name: 'Pesquisar' }))

    expect(props.onSearch).toHaveBeenCalledTimes(1)
    expect(props.onSearch).toHaveBeenCalledWith('Curitiba')
  })

  test('dispara onSearch ao pressionar Enter e cancela o comportamento padrão', () => {
    const { props } = renderSearchBar()
    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: 'Porto Alegre' } })
    const notPrevented = fireEvent.keyDown(input, { key: 'Enter' })

    expect(props.onSearch).toHaveBeenCalledWith('Porto Alegre')
    expect(notPrevented).toBe(false)
  })

  test('ignora outras teclas', () => {
    const { props } = renderSearchBar()

    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'a' })

    expect(props.onSearch).not.toHaveBeenCalled()
  })

  test('ao clicar em Localização Atual, limpa o campo e devolve o foco a ele', () => {
    const { props } = renderSearchBar()
    const input = screen.getByRole('textbox')

    fireEvent.change(input, { target: { value: 'Recife' } })
    fireEvent.click(screen.getByRole('button', { name: 'Localização Atual' }))

    expect(input).toHaveValue('')
    expect(input).toHaveFocus()
    expect(props.onLocate).toHaveBeenCalledTimes(1)
  })

  test('não recebe aria-disabled nem is-busy sem busy', () => {
    renderSearchBar()

    expect(screen.getByRole('button', { name: 'Pesquisar' })).not.toHaveAttribute('aria-disabled')
    expect(screen.getByRole('button', { name: 'Localização Atual' })).not.toHaveAttribute('aria-disabled')
    expect(screen.getByRole('button', { name: 'Pesquisar' })).not.toHaveClass('is-busy')
  })

  test('com busy search, bloqueia os dois botões sem usar disabled', () => {
    const { props } = renderSearchBar({ busy: SEARCH_BUSY })
    const searchButton = screen.getByRole('button', { name: 'Pesquisar' })
    const locateButton = screen.getByRole('button', { name: 'Localização Atual' })

    expect(searchButton).toHaveAttribute('aria-disabled', 'true')
    expect(locateButton).toHaveAttribute('aria-disabled', 'true')
    expect(searchButton).toHaveClass('is-busy')
    expect(locateButton).toHaveClass('is-busy')
    expect(searchButton).not.toBeDisabled()
    expect(locateButton).not.toBeDisabled()

    fireEvent.click(searchButton)
    fireEvent.click(locateButton)
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })

    expect(props.onSearch).not.toHaveBeenCalled()
    expect(props.onLocate).not.toHaveBeenCalled()
  })

  test('com busy locate e status idle, bloqueia só o botão de localização', () => {
    const { props } = renderSearchBar({ busy: LOCATE_BUSY, status: IDLE_STATUS })
    const searchButton = screen.getByRole('button', { name: 'Pesquisar' })
    const locateButton = screen.getByRole('button', { name: 'Localização Atual' })

    expect(locateButton).toHaveAttribute('aria-disabled', 'true')
    expect(locateButton).toHaveClass('is-busy')
    expect(searchButton).not.toHaveAttribute('aria-disabled')
    expect(searchButton).not.toHaveClass('is-busy')

    fireEvent.click(locateButton)
    expect(props.onLocate).not.toHaveBeenCalled()

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Lisboa' } })
    fireEvent.click(searchButton)
    expect(props.onSearch).toHaveBeenCalledWith('Lisboa')
  })

  test('com busy locate e status loading, bloqueia também a busca', () => {
    const { props } = renderSearchBar({ busy: LOCATE_BUSY, status: LOADING_STATUS })
    const searchButton = screen.getByRole('button', { name: 'Pesquisar' })

    expect(searchButton).toHaveAttribute('aria-disabled', 'true')

    fireEvent.click(searchButton)
    expect(props.onSearch).not.toHaveBeenCalled()
  })

  test('o texto dos botões não muda durante o processamento', () => {
    renderSearchBar({ busy: SEARCH_BUSY })

    expect(screen.getByRole('button', { name: 'Pesquisar' })).toHaveTextContent('Pesquisar')
    expect(screen.getByRole('button', { name: 'Localização Atual' })).toHaveTextContent('Localização Atual')
  })

  test('recebe a classe in ao interseccionar', () => {
    const { container } = renderSearchBar()

    expect(container.querySelector('.search')).toHaveClass('reveal')
    expect(container.querySelector('.search')).not.toHaveClass('in')
  })
})
