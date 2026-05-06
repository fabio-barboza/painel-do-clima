import React, { useState } from 'react';
import { useWeather } from './hooks/useWeather';
import { weatherCodes } from './utils/weatherCodes';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import SkeletonLoader from './components/SkeletonLoader';
import ErrorMessage from './components/ErrorMessage';
import './App.css';

export default function App() {
  const { data, loading, error, searchCity, searchCoords, retry } = useWeather();
  const [geoError, setGeoError] = useState(null);

  function handleGeoError(message) {
    setGeoError(message);
    setTimeout(() => setGeoError(null), 4000);
  }

  const heroColor = data
    ? weatherCodes.getThemeColor(data.current.weather_code)
    : '#1b1938';

  const locationName = data?.location?.name || null;

  return (
    <div className="app">
      <div
        className="hero"
        style={{ background: `linear-gradient(180deg, ${heroColor} 0%, ${heroColor}dd 100%)` }}
      >
        <h1 className="hero-title">Painel do Clima</h1>
        <p className="hero-subtitle">
          Consulte a previsão do tempo de qualquer cidade do mundo
        </p>
        <SearchBar
          onSearch={searchCity}
          onGeoSearch={searchCoords}
          onGeoError={handleGeoError}
        />
        {geoError && (
          <p className="hero__geo-error">{geoError}</p>
        )}
        {locationName && (
          <p className="hero__location">{locationName}</p>
        )}
        {data && !locationName && (
          <p className="hero__location">Sua localização</p>
        )}
      </div>

      <div className="container">
        {loading && (
          <div className="app__loading">
            <SkeletonLoader type="current" />
            <SkeletonLoader type="hourly" />
            <SkeletonLoader type="daily" />
          </div>
        )}

        {error && (
          <ErrorMessage message={error} onRetry={retry} />
        )}

        {data && !loading && (
          <>
            <CurrentWeather data={data.current} dailyData={data.daily} />
            <HourlyForecast hourlyData={data.hourly} />
            <DailyForecast dailyData={data.daily} />
          </>
        )}
      </div>
    </div>
  );
}
