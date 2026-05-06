import React, { useState } from 'react';

export default function SearchBar({ onSearch, onGeoSearch, onGeoError }) {
  const [city, setCity] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = city.trim();
    if (trimmed) {
      onSearch(trimmed);
    }
  }

  function handleGeoClick() {
    if (!navigator.geolocation) {
      onGeoError('Geolocalização não suportada pelo navegador');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onGeoSearch(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          onGeoError('Permissão de localização negada');
        } else {
          onGeoError('Não foi possível obter sua localização');
        }
      }
    );
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        className="search-bar__input"
        placeholder="Buscar cidade..."
        value={city}
        onChange={(e) => setCity(e.target.value)}
        aria-label="Nome da cidade"
      />
      <button type="submit" className="search-bar__button">
        Buscar
      </button>
      <button
        type="button"
        className="search-bar__geo-button"
        onClick={handleGeoClick}
        aria-label="Usar minha localização"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
      </button>
    </form>
  );
}
