import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ErrorState from '../components/ErrorState.jsx'

function renderErrorState(error, onRetry = vi.fn()) {
  const view = render(<ErrorState error={error} onRetry={onRetry} />)
  return { onRetry, ...view }
}

describe('ErrorState', () => {
  it('cidade não encontrada: mensagem amigável orientando nova tentativa, sem botão de retry', () => {
    renderErrorState({ type: 'city_not_found', message: "Cidade 'xyz' não encontrada." })
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Cidade não encontrada')
    expect(alert).toHaveTextContent('Verifique se o nome está correto e tente novamente.')
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).not.toBeInTheDocument()
  })

  it('falha de rede: mensagem amigável com botão "Tentar novamente"', () => {
    renderErrorState({ type: 'network', message: 'Falha de comunicação com o servidor.' })
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Falha de comunicação')
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
  })

  it('busca inválida: mensagem amigável com botão "Tentar novamente"', () => {
    renderErrorState({ type: 'invalid', message: "Informe 'city' ou 'lat' e 'lon'." })
    expect(screen.getByRole('alert')).toHaveTextContent('Busca inválida')
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
  })

  it('clicar em "Tentar novamente" invoca onRetry uma única vez', () => {
    const { onRetry } = renderErrorState({ type: 'network', message: 'Falha de comunicação.' })
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('tipo de erro desconhecido usa a mensagem de falha de comunicação', () => {
    renderErrorState({ type: 'desconhecido', message: 'x' })
    expect(screen.getByRole('alert')).toHaveTextContent('Falha de comunicação')
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
  })

  it('geolocalização negada: mensagem amigável orientando busca manual, sem botão de retry', () => {
    renderErrorState({
      type: 'geolocation',
      message: 'Não foi possível acessar sua localização. Você pode pesquisar a cidade pelo nome no campo acima.',
    })
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Localização indisponível')
    expect(alert).toHaveTextContent('Você pode pesquisar a cidade pelo nome no campo acima.')
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).not.toBeInTheDocument()
  })
})
