import React, { useMemo } from 'react'
import IconSprite from './components/IconSprite.jsx'
import SkyBackground from './components/SkyBackground.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Reveal from './components/Reveal.jsx'
import SearchBar from './components/SearchBar.jsx'
import EmptyState from './components/EmptyState.jsx'
import Skeleton from './components/Skeleton.jsx'
import ErrorState from './components/ErrorState.jsx'
import CurrentConditions from './components/CurrentConditions.jsx'
import HourlyChart from './components/HourlyChart.jsx'
import StatsGrid from './components/StatsGrid.jsx'
import WeeklyForecast from './components/WeeklyForecast.jsx'
import useWeather from './hooks/useWeather.js'
import { weatherCodeInfo } from './lib/weatherCodes.js'

function computeTint(data) {
  return data ? weatherCodeInfo(data.current.weather_code).tint : 'clear'
}

function focusSearch() {
  const el = document.getElementById('searchInput')
  el?.focus()
  el?.select()
}

function DataPanel({ data, chartKey }) {
  return (
    <>
      <div className="grid-main">
        <Reveal delay=".08s">
          <CurrentConditions data={data} />
        </Reveal>
        <Reveal delay=".16s">
          <HourlyChart key={chartKey} hourly={data.hourly} nowIndex={0} />
        </Reveal>
      </div>
      <Reveal delay=".24s">
        <StatsGrid data={data} />
      </Reveal>
      <Reveal delay=".32s">
        <WeeklyForecast daily={data.daily} />
      </Reveal>
    </>
  )
}

function Sections({ status, data, error, chartKey, onLocate, onRetry }) {
  if (status === 'loading') {
    return <Skeleton variant="panel" />
  }
  if (status === 'success') {
    return <DataPanel data={data} chartKey={chartKey} />
  }
  if (status === 'idle') {
    return <EmptyState onSearchFocus={focusSearch} onLocate={onLocate} />
  }
  if (error?.kind === 'geo') {
    return data
      ? <DataPanel data={data} chartKey={chartKey} />
      : <EmptyState onSearchFocus={focusSearch} onLocate={onLocate} />
  }
  return <ErrorState kind={error.kind} message={error.message} onRetry={onRetry} onFocusSearch={focusSearch} />
}

function App() {
  const { status, data, error, search, locate, retry } = useWeather()

  const chartKey = useMemo(() => {
    if (!data) return 'idle'
    return `${data.city.display ?? ''}|${data.timezone}|${data.current.time}`
  }, [data])

  const geoError = error?.kind === 'geo' ? error.message : null
  const tint = computeTint(data)

  return (
    <div data-tint={tint}>
      <IconSprite />
      <SkyBackground tint={tint} />
      <main className="dashboard">
        <Reveal delay="0s"><Header /></Reveal>
        <Reveal delay=".06s">
          <SearchBar
            onSubmit={search}
            onLocate={locate}
            loading={status === 'loading'}
            geoError={geoError}
          />
        </Reveal>
        <Sections
          status={status}
          data={data}
          error={error}
          chartKey={chartKey}
          onLocate={locate}
          onRetry={retry}
        />
        <Reveal delay=".4s"><Footer /></Reveal>
      </main>
    </div>
  )
}

export default App
