import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorMessage from '../components/ErrorMessage';

describe('ErrorMessage', () => {
  test('exibe mensagem de erro', () => {
    render(<ErrorMessage message="Cidade não encontrada" />);

    expect(screen.getByText('Cidade não encontrada')).toBeInTheDocument();
  });

  test('exibe botao de retry quando onRetry e fornecido', () => {
    const mockRetry = vi.fn();
    render(<ErrorMessage message="Erro" onRetry={mockRetry} />);

    const retryButton = screen.getByText('Tentar novamente');
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  test('nao exibe botao de retry quando onRetry nao e fornecido', () => {
    render(<ErrorMessage message="Erro" />);

    expect(screen.queryByText('Tentar novamente')).not.toBeInTheDocument();
  });

  test('renderiza icone de erro', () => {
    const { container } = render(<ErrorMessage message="Erro" />);

    expect(container.querySelector('.error-message__icon')).toBeInTheDocument();
  });
});
