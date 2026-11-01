import React from 'react'

const STATES = {
  'not-found': {
    title: 'Cidade não encontrada',
    subtitle: 'Verifique a grafia do nome e tente novamente.',
    action: { label: 'Nova busca', focus: true },
  },
  'bad-request': {
    title: 'Informe um nome de cidade',
    subtitle: 'Digite o nome de uma cidade válida (ex.: Curitiba).',
    action: { label: 'Nova busca', focus: true },
  },
  'network': {
    title: 'Não foi possível carregar o clima',
    subtitle: 'Verifique sua conexão e tente novamente.',
    action: { label: 'Tentar novamente', retry: true },
  },
}

function ErrorState({ kind, message, onRetry, onFocusSearch }) {
  const state = STATES[kind] ?? STATES['network']
  const { title, action } = state
  const subtitle = message ?? state.subtitle

  function handleAction() {
    if (action.retry) {
      onRetry?.()
      return
    }
    onFocusSearch?.()
  }

  return (
    <section className="card state-card" aria-label="Erro ao carregar o clima">
      <svg className="ico error-ico" aria-hidden="true"><use href="#i-cloud" /></svg>
      <h2>{title}</h2>
      <div className="sub">{subtitle}</div>
      <div className="state-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleAction}
        >
          <span>{action.label}</span>
        </button>
      </div>
    </section>
  )
}

export default ErrorState
