import React, { useRef, useState } from 'react'
import useReveal from '../hooks/useReveal.js'

const ENTER_KEY = 'Enter'
const SEARCH_BUSY = 'search'
const LOCATE_BUSY = 'locate'
const LOADING_STATUS = 'loading'

function SearchBar({ status, busy, onSearch, onLocate }) {
  const [ref, revealed] = useReveal()
  const inputRef = useRef(null)
  const [text, setText] = useState('')

  const searchBlocked = busy === SEARCH_BUSY || (busy === LOCATE_BUSY && status === LOADING_STATUS)
  const locateBlocked = busy === SEARCH_BUSY || busy === LOCATE_BUSY

  function runSearch() {
    if (searchBlocked) return
    onSearch(text)
  }

  function handleKeyDown(event) {
    if (event.key !== ENTER_KEY) return
    event.preventDefault()
    runSearch()
  }

  function runLocate() {
    if (locateBlocked) return
    setText('')
    inputRef.current?.focus()
    onLocate()
  }

  return (
    <div ref={ref} className={revealed ? 'search reveal in' : 'search reveal'} style={{ '--d': '.06s' }} role="search">
      <svg className="ico search-ico"><use href="#i-search" /></svg>
      <input
        ref={inputRef}
        type="text"
        id="searchInput"
        placeholder="Pesquisar cidade ou região…"
        aria-label="Pesquisar cidade ou região"
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="search-btns">
        <button
          className={searchBlocked ? 'btn btn-primary is-busy' : 'btn btn-primary'}
          id="btnSearch"
          type="button"
          aria-disabled={searchBlocked || undefined}
          onClick={runSearch}
        >
          <svg className="ico"><use href="#i-search" /></svg><span className="btn-text">Pesquisar</span>
        </button>
        <button
          className={locateBlocked ? 'btn btn-ghost is-busy' : 'btn btn-ghost'}
          id="btnLocate"
          type="button"
          title="Usar minha localização"
          aria-disabled={locateBlocked || undefined}
          onClick={runLocate}
        >
          <svg className="ico"><use href="#i-gps" /></svg><span className="btn-text">Localização Atual</span>
        </button>
      </div>
    </div>
  )
}

export default SearchBar
