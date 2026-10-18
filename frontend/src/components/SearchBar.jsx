import React from 'react'

function LocateIcon() {
  return (
    <svg
      className="search-bar-locate-icon"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
      <path
        d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SearchBar({ onSearch, onLocate, loading = false }) {
  function handleSubmit(event) {
    event.preventDefault()
    const rawCity = new FormData(event.currentTarget).get('city')
    const city = String(rawCity ?? '').trim()
    if (!city) {
      return
    }
    onSearch(city)
  }

  return (
    <form className="search-bar" role="search" aria-busy={loading} onSubmit={handleSubmit}>
      <label htmlFor="search-bar-city" className="search-bar-label">
        Cidade
      </label>
      <div className="search-bar-row">
        <input
          id="search-bar-city"
          name="city"
          className="input search-bar-input"
          type="text"
          placeholder="Digite o nome da cidade"
          autoComplete="off"
          required
          disabled={loading}
        />
        <button type="submit" className="btn search-bar-submit" disabled={loading}>
          {loading ? 'Buscando…' : 'Buscar'}
        </button>
        <button
          type="button"
          className="btn btn-secondary search-bar-locate"
          aria-label="Usar minha localização"
          title="Usar minha localização"
          disabled={loading}
          onClick={onLocate}
        >
          <LocateIcon />
        </button>
      </div>
    </form>
  )
}

export default SearchBar
