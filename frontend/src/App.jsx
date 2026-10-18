import React, { useRef } from 'react'
import SearchBar from './components/SearchBar.jsx'
import Skeletons from './components/Skeletons.jsx'
import ErrorState from './components/ErrorState.jsx'
import CurrentWeather from './components/CurrentWeather.jsx'
import HourlyChart from './components/HourlyChart.jsx'
import WeeklyForecast from './components/WeeklyForecast.jsx'
import { useWeather } from './hooks/useWeather.js'
import {
  categorizeWeatherCode,
  getTheme,
  deriveCurrent,
  deriveHourly24,
  deriveDaily7,
} from './utils/weatherCode.js'
import './App.css'

function IdleContent() {
  return (
    <p className="text-muted panel-idle">
      Digite o nome de uma cidade no campo acima para ver o clima agora, nas próximas horas e nos próximos 7 dias.
    </p>
  )
}

function SuccessContent({ data }) {
  const cityName = data?.location?.name ?? 'Sua localização'
  const current = deriveCurrent(data?.forecast)
  const hourly24 = deriveHourly24(data?.forecast)
  const daily7 = deriveDaily7(data?.forecast)
  return (
    <>
      <h2 className="panel-city-title">{cityName}</h2>
      <div className="panel-grid">
        <section className="card" aria-labelledby="card-current-title">
          <h3 className="card-title" id="card-current-title">Condições atuais</h3>
          <CurrentWeather current={current} />
        </section>
        <section className="card" aria-labelledby="card-hourly-title">
          <h3 className="card-title" id="card-hourly-title">Próximas 24 horas</h3>
          <HourlyChart data={hourly24} />
        </section>
        <section className="card" aria-labelledby="card-weekly-title">
          <h3 className="card-title" id="card-weekly-title">Próximos 7 dias</h3>
          <WeeklyForecast days={daily7} />
        </section>
      </div>
    </>
  )
}

function App() {
  const { status, data, error, search, locate } = useWeather()
  const lastQueryRef = useRef(null)

  function handleSearch(city) {
    lastQueryRef.current = { city }
    search(city)
  }

  function handleRetry() {
    const lastQuery = lastQueryRef.current
    if (!lastQuery) {
      return
    }
    search(lastQuery.city)
  }

  const theme =
    status === 'success' ? getTheme(categorizeWeatherCode(data?.forecast?.current?.weather_code)) : undefined

  return (
    <div className="app-shell" data-theme={theme}>
      <div className="panel">
        <header className="panel-header">
          <h1 className="panel-title">Painel do Clima</h1>
          <p className="text-muted panel-subtitle">
            Clima atual, próximas 24 horas e próximos 7 dias em um único painel.
          </p>
          <SearchBar onSearch={handleSearch} onLocate={locate} loading={status === 'loading'} />
        </header>
        <main className="panel-content">
          {status === 'idle' && <IdleContent />}
          {status === 'loading' && <Skeletons />}
          {status === 'error' && <ErrorState error={error} onRetry={handleRetry} />}
          {status === 'success' && <SuccessContent data={data} />}
        </main>
      </div>
    </div>
  )
}

export default App
