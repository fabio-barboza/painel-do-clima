import React, { useRef } from 'react'
import useReveal from '../hooks/useReveal.js'

function Reveal({ delay, instant = false, className, children }) {
  const ref = useRef(null)
  useReveal(ref)

  const base = 'reveal'
  const additional = instant ? 'in' : ''
  const classes = [base, additional, className].filter(Boolean).join(' ')

  return (
    <div
      ref={instant ? undefined : ref}
      className={classes}
      style={{ '--d': delay }}
    >
      {children}
    </div>
  )
}

export default Reveal
