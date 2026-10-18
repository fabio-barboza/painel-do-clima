import React from 'react'

function Skeletons() {
  return (
    <div className="skeletons" role="status" aria-label="Carregando dados do clima">
      <div className="panel-grid">
        <div className="card">
          <div className="skeleton skeleton-heading" />
          <div className="skeleton skeleton-text" />
          <div className="skeleton skeleton-text" />
          <div className="skeleton skeleton-text" />
        </div>
        <div className="card">
          <div className="skeleton skeleton-heading" />
          <div className="skeleton skeleton-block" />
        </div>
        <div className="card">
          <div className="skeleton skeleton-heading" />
          <div className="skeleton skeleton-text" />
          <div className="skeleton skeleton-text" />
        </div>
      </div>
    </div>
  )
}

export default Skeletons
