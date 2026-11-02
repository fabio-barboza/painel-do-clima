import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import Notice from '../components/Notice.jsx'

const INFO_KIND = 'info'
const ERROR_KIND = 'error'
const EMPTY_MESSAGE = 'Digite o nome de uma cidade ou região para pesquisar.'
const FAILURE_MESSAGE = 'Não foi possível obter os dados do clima agora.'
const RETRY_LABEL = 'Tentar novamente'

describe('Notice', () => {
  test('usa role alert para erros', () => {
    render(<Notice kind={ERROR_KIND} message={FAILURE_MESSAGE} canRetry={false} onRetry={vi.fn()} />)

    expect(screen.getByRole('alert')).toHaveTextContent(FAILURE_MESSAGE)
  })

  test('usa role status para orientações', () => {
    render(<Notice kind={INFO_KIND} message={EMPTY_MESSAGE} canRetry={false} onRetry={vi.fn()} />)

    expect(screen.getByRole('status')).toHaveTextContent(EMPTY_MESSAGE)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  test('usa as classes card e notice, com o texto em p', () => {
    const { container } = render(
      <Notice kind={INFO_KIND} message={EMPTY_MESSAGE} canRetry={false} onRetry={vi.fn()} />,
    )
    const notice = container.querySelector('.notice')

    expect(notice).toHaveClass('card')
    expect(notice.querySelector('p')).toHaveTextContent(EMPTY_MESSAGE)
  })

  test('mostra o botão Tentar novamente quando canRetry e dispara onRetry', () => {
    const onRetry = vi.fn()
    render(<Notice kind={ERROR_KIND} message={FAILURE_MESSAGE} canRetry onRetry={onRetry} />)
    const retryButton = screen.getByRole('button', { name: RETRY_LABEL })

    fireEvent.click(retryButton)

    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  test('o botão de nova tentativa é um button nativo, alcançável pelo teclado', () => {
    render(<Notice kind={ERROR_KIND} message={FAILURE_MESSAGE} canRetry onRetry={vi.fn()} />)
    const retryButton = screen.getByRole('button', { name: RETRY_LABEL })

    expect(retryButton.tagName).toBe('BUTTON')
    expect(retryButton).toHaveAttribute('type', 'button')
    expect(retryButton.tabIndex).toBeGreaterThanOrEqual(0)
    retryButton.focus()
    expect(retryButton).toHaveFocus()
  })

  test('não mostra o botão de nova tentativa sem canRetry', () => {
    render(<Notice kind={ERROR_KIND} message={FAILURE_MESSAGE} canRetry={false} onRetry={vi.fn()} />)

    expect(screen.queryByRole('button', { name: RETRY_LABEL })).not.toBeInTheDocument()
  })
})
