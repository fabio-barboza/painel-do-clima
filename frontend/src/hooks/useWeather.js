import { useState, useRef, useCallback } from 'react';
import { weatherApi } from '../services/weatherApi';

export function useWeather() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastSearch = useRef(null);

  const executeSearch = useCallback(async (searchFn) => {
    setLoading(true);
    setError(null);

    try {
      const result = await searchFn();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchCity = useCallback((city) => {
    lastSearch.current = { type: 'city', params: city };
    executeSearch(() => weatherApi.fetchByCity(city));
  }, [executeSearch]);

  const searchCoords = useCallback((lat, lon) => {
    lastSearch.current = { type: 'coords', params: { lat, lon } };
    executeSearch(() => weatherApi.fetchByCoords(lat, lon));
  }, [executeSearch]);

  const retry = useCallback(() => {
    if (!lastSearch.current) return;

    const search = lastSearch.current;
    if (search.type === 'city') {
      executeSearch(() => weatherApi.fetchByCity(search.params));
    } else {
      executeSearch(() => weatherApi.fetchByCoords(search.params.lat, search.params.lon));
    }
  }, [executeSearch]);

  return { data, loading, error, searchCity, searchCoords, retry };
}
