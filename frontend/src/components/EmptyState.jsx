import React from 'react'

function EmptyState({ onSearchFocus, onLocate }) {
  return (
    <section className="card state-card" aria-label="Clima vazio">
      <svg className="ico empty-ico" aria-hidden="true"><use href="#i-search" /></svg>
      <h2>Pesquise uma cidade</h2>
      <div className="sub">Digite o nome de uma cidade acima ou use sua localização para ver o clima agora.</div>
      <div className="state-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onSearchFocus?.()}
        >
          <svg className="ico" aria-hidden="true"><use href="#i-search" /></svg>
          <span>Pesquisar</span>
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onLocate}
        >
          <svg className="ico" aria-hidden="true"><use href="#i-gps" /></svg>
          <span>Localização Atual</span>
        </button>
      </div>
    </section>
  )
}

export default EmptyState
