import React from 'react'

const UV_SCALE_MAX = 11

function normalizeUv(value) {
  if (value === null || value === undefined) {
    return null
  }
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) {
    return null
  }
  return Math.min(Math.max(numeric, 0), UV_SCALE_MAX)
}

function buildAriaLabel(value) {
  if (value === null) {
    return 'Índice UV indisponível'
  }
  return `Índice UV atual ${value.toLocaleString('pt-BR')} em uma escala de 0 a ${UV_SCALE_MAX}`
}

function UVBar({ value }) {
  const normalized = normalizeUv(value)
  const position = normalized === null ? 0 : (normalized / UV_SCALE_MAX) * 100
  const label = buildAriaLabel(normalized)
  const roleProps =
    normalized === null
      ? { role: 'status' }
      : { role: 'meter', 'aria-valuenow': normalized, 'aria-valuemin': 0, 'aria-valuemax': UV_SCALE_MAX }
  return (
    <div className="uv-bar" aria-label={label} {...roleProps}>
      <div className="uv-bar-track" />
      <span className="uv-bar-marker" style={{ left: `${position}%` }} />
      {normalized === null && <span className="visually-hidden">{label}</span>}
    </div>
  )
}

export default UVBar
