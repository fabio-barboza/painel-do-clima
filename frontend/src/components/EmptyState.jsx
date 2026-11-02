import React from 'react'
import useReveal from '../hooks/useReveal.js'

const EMPTY_TITLE = 'Consulte o clima'
const EMPTY_SUBTITLE = 'Pesquise uma cidade ou use sua localização atual para ver as condições do tempo.'

function EmptyState() {
  const [ref, revealed] = useReveal()

  return (
    <section
      ref={ref}
      className={revealed ? 'card reveal in' : 'card reveal'}
      style={{ '--d': '.08s' }}
      aria-label={EMPTY_TITLE}
    >
      <div className="card-head">
        <div>
          <h2>{EMPTY_TITLE}</h2>
          <div className="sub">{EMPTY_SUBTITLE}</div>
        </div>
      </div>
    </section>
  )
}

export default EmptyState
