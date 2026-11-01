import React from 'react'
import Icon from './Icon.jsx'
import Clock from './Clock.jsx'

function Header() {
  return (
    <header className="top">
      <div className="brand">
        <span className="brand-mark"><Icon name="brand" /></span>
        <div>
          <h1>Painel do Clima</h1>
          <small>Tempo em tempo real</small>
        </div>
      </div>
      <Clock />
    </header>
  )
}

export default Header
