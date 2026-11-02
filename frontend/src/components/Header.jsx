import React from 'react'
import Clock from './Clock.jsx'
import Icon from './Icon.jsx'
import useReveal from '../hooks/useReveal.js'

function Header() {
  const [ref, revealed] = useReveal()

  return (
    <header ref={ref} className={revealed ? 'top reveal in' : 'top reveal'} style={{ '--d': '0s' }}>
      <div className="brand">
        <span className="brand-mark">
          <Icon name="brand" />
        </span>
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
