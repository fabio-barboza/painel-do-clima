import React from 'react'
import Icon from './Icon.jsx'

const DEFAULT_TONE = 'plain'

function Chip({ tone = DEFAULT_TONE, icon, children }) {
  return (
    <span className={`chip ${tone}`}>
      {icon && (
        <>
          <Icon name={icon} />{' '}
        </>
      )}
      {children}
    </span>
  )
}

export default Chip
