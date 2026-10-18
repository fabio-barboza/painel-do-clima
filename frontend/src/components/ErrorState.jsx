import React from 'react'

const ERROR_CONTENT = {
  city_not_found: {
    title: 'Cidade não encontrada',
    message: 'Não encontramos a cidade pesquisada. Verifique se o nome está correto e tente novamente.',
    retryable: false,
  },
  invalid: {
    title: 'Busca inválida',
    message: 'A busca informada não é válida. Confira o nome da cidade e tente novamente.',
    retryable: true,
  },
  network: {
    title: 'Falha de comunicação',
    message: 'Não foi possível conectar ao serviço de clima. Tente novamente em instantes.',
    retryable: true,
  },
  geolocation: {
    title: 'Localização indisponível',
    message: 'Não foi possível acessar sua localização. Você pode pesquisar a cidade pelo nome no campo acima.',
    retryable: false,
  },
}

function ErrorState({ error, onRetry }) {
  const content = ERROR_CONTENT[error?.type] ?? ERROR_CONTENT.network
  return (
    <div className="card error-state" role="alert">
      <h2 className="card-title error-state-title">{content.title}</h2>
      <p className="text-muted error-state-message">{content.message}</p>
      {content.retryable && (
        <button type="button" className="btn btn-secondary error-state-retry" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  )
}

export default ErrorState
