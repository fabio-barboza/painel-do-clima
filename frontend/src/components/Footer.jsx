import React from 'react'
import useReveal from '../hooks/useReveal.js'

function Footer() {
  const [ref, revealed] = useReveal()

  return (
    <footer ref={ref} className={revealed ? 'reveal in' : 'reveal'} style={{ '--d': '.4s' }}>
      <b>Painel do Clima</b> · dados meteorológicos por{' '}
      <a href="https://open-meteo.com/">Open-Meteo.com</a>
    </footer>
  )
}

export default Footer
