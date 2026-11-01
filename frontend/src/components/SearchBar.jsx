import React, { useState } from 'react'
import Icon from './Icon.jsx'

function SearchBar({ onSubmit, onLocate, loading = false, geoError = null }) {
  const [value, setValue] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(value.trim())
  }

  return (
    <form
      className="search"
      role="search"
      aria-busy={loading}
      onSubmit={handleSubmit}
    >
      <svg className="ico search-ico" aria-hidden="true"><use href="#i-search"/></svg>
      <input
        type="text"
        id="searchInput"
        value={value}
        placeholder="Pesquisar cidade ou região…"
        aria-label="Pesquisar cidade ou região"
        onChange={(event) => setValue(event.target.value)}
      />
      <div className="search-btns">
        <button
          className={`btn btn-primary${loading ? ' is-loading' : ''}`}
          id="btnSearch"
          type="submit"
        >
          {loading ? <span className="spin" aria-hidden="true" /> : <Icon name="search" />}
          <span className="btn-text">Pesquisar</span>
        </button>
        <button
          className="btn btn-ghost"
          id="btnLocate"
          type="button"
          title="Usar minha localização"
          onClick={onLocate}
        >
          <Icon name="gps" />
          <span className="btn-text">Localização Atual</span>
        </button>
      </div>
      {geoError && (
        <div className="search-error" role="alert">
          <Icon name="drop" />
          <span>{geoError}</span>
        </div>
      )}
    </form>
  )
}

export default SearchBar
