import React from 'react'

function Icon({ name }) {
  return (
    <svg className="ico" aria-hidden="true">
      <use href={`#i-${name}`} />
    </svg>
  )
}

export default Icon
