import React, { useEffect, useRef } from 'react'

const ERROR_KIND = 'error'
const ERROR_ROLE = 'alert'
const INFO_ROLE = 'status'
const RETRY_LABEL = 'Tentar novamente'

function Notice({ kind, message, canRetry, onRetry, focusRetry = false }) {
  const role = kind === ERROR_KIND ? ERROR_ROLE : INFO_ROLE
  const retryRef = useRef(null)

  useEffect(() => {
    if (focusRetry && canRetry) retryRef.current?.focus()
  }, [focusRetry, canRetry])

  return (
    <div className="card notice" role={role}>
      <p>{message}</p>
      {canRetry && (
        <button ref={retryRef} className="btn btn-primary" type="button" onClick={onRetry}>
          {RETRY_LABEL}
        </button>
      )}
    </div>
  )
}

export default Notice
