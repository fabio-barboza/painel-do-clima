import React from 'react'

function Icon({ name }) {
  return (
    <svg className="ico">
      <use href={`#i-${name}`} />
    </svg>
  )
}

export default Icon
