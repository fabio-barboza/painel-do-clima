import React, { useState } from 'react'
import SkyBackground from './components/SkyBackground.jsx'
import Header from './components/Header.jsx'
import SearchBar from './components/SearchBar.jsx'
import EmptyState from './components/EmptyState.jsx'
import DashboardSkeleton from './components/DashboardSkeleton.jsx'
import Notice from './components/Notice.jsx'
import Footer from './components/Footer.jsx'
import Dashboard from './components/Dashboard.jsx'
import useWeather from './hooks/useWeather.js'
import { getWeatherInfo } from './lib/weatherCodes.js'

const REFERENCE_SKY = 'reference'
const STATUS_LOADING = 'loading'
const PANEL_EMPTY = 'empty'
const PANEL_SKELETON = 'skeleton'
const PANEL_DATA = 'data'
const LOADING_ANNOUNCEMENT = 'Carregando dados do clima'
const ARIA_BUSY_WHILE_LOADING = 'true'

function selectPanel(status, data) {
  if (status === STATUS_LOADING) return PANEL_SKELETON
  if (data) return PANEL_DATA
  return PANEL_EMPTY
}

function selectSky(data) {
  if (!data) return REFERENCE_SKY
  return getWeatherInfo(data.current.weather_code).sky
}

function renderPanel(panel, weather, locationLabel) {
  if (panel === PANEL_SKELETON) return <DashboardSkeleton />
  if (panel === PANEL_DATA) return <Dashboard weather={weather} locationLabel={locationLabel} />
  return <EmptyState />
}

function App() {
  const { status, busy, data, locationLabel, notice, search, locate, retry } = useWeather()
  const [retrying, setRetrying] = useState(false)
  const loading = status === STATUS_LOADING
  const panel = selectPanel(status, data)

  function handleRetry() {
    setRetrying(true)
    retry()
  }

  function handleSearch(text) {
    setRetrying(false)
    search(text)
  }

  function handleLocate() {
    setRetrying(false)
    locate()
  }

  return (
    <>
      <SkyBackground sky={selectSky(data)} />
      <main className="dashboard" aria-busy={loading ? ARIA_BUSY_WHILE_LOADING : undefined}>
        <Header />
        <SearchBar status={status} busy={busy} onSearch={handleSearch} onLocate={handleLocate} />
        {notice && (
          <Notice
            kind={notice.kind}
            message={notice.message}
            canRetry={notice.canRetry}
            onRetry={handleRetry}
            focusRetry={retrying}
          />
        )}
        <div className="sr-only" role="status">
          {loading ? LOADING_ANNOUNCEMENT : null}
        </div>
        {renderPanel(panel, data, locationLabel)}
        <Footer />
      </main>
    </>
  )
}

export default App
