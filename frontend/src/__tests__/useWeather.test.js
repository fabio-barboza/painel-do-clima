import { vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWeather } from '../hooks/useWeather';
import { weatherApi } from '../services/weatherApi';

vi.mock('../services/weatherApi');

describe('useWeather', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPayload = {
    location: { name: 'Sao Paulo', latitude: -23.55, longitude: -46.63 },
    current: { temperature_2m: 20.9 },
    hourly: { time: ['2026-05-05T00:00'] },
    daily: { time: ['2026-05-05'] }
  };

  describe('estados iniciais', () => {
    test('retorna estados iniciais nulos', () => {
      const { result } = renderHook(() => useWeather());

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('searchCity', () => {
    test('transiciona loading → success para cidade valida', async () => {
      weatherApi.fetchByCity.mockResolvedValue(mockPayload);

      const { result } = renderHook(() => useWeather());

      await act(async () => {
        result.current.searchCity('São Paulo');
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockPayload);
      expect(result.current.error).toBeNull();
      expect(weatherApi.fetchByCity).toHaveBeenCalledWith('São Paulo');
    });

    test('transiciona loading → error para cidade invalida', async () => {
      weatherApi.fetchByCity.mockRejectedValue(new Error('Cidade não encontrada'));

      const { result } = renderHook(() => useWeather());

      await act(async () => {
        result.current.searchCity('InvalidCity');
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe('Cidade não encontrada');
    });
  });

  describe('searchCoords', () => {
    test('transiciona loading → success para coordenadas validas', async () => {
      weatherApi.fetchByCoords.mockResolvedValue(mockPayload);

      const { result } = renderHook(() => useWeather());

      await act(async () => {
        result.current.searchCoords(-23.55, -46.63);
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockPayload);
      expect(result.current.error).toBeNull();
      expect(weatherApi.fetchByCoords).toHaveBeenCalledWith(-23.55, -46.63);
    });

    test('transiciona loading → error para coordenadas com falha', async () => {
      weatherApi.fetchByCoords.mockRejectedValue(new Error('Erro ao consultar o clima'));

      const { result } = renderHook(() => useWeather());

      await act(async () => {
        result.current.searchCoords(0, 0);
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe('Erro ao consultar o clima');
    });
  });

  describe('retry', () => {
    test('retry apos erro de cidade repete a busca', async () => {
      weatherApi.fetchByCity
        .mockRejectedValueOnce(new Error('Cidade não encontrada'))
        .mockResolvedValueOnce(mockPayload);

      const { result } = renderHook(() => useWeather());

      await act(async () => {
        result.current.searchCity('São Paulo');
      });

      expect(result.current.error).toBe('Cidade não encontrada');

      await act(async () => {
        result.current.retry();
      });

      expect(result.current.data).toEqual(mockPayload);
      expect(result.current.error).toBeNull();
      expect(weatherApi.fetchByCity).toHaveBeenCalledTimes(2);
    });

    test('retry apos erro de coordenadas repete a busca', async () => {
      weatherApi.fetchByCoords
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockPayload);

      const { result } = renderHook(() => useWeather());

      await act(async () => {
        result.current.searchCoords(-23.55, -46.63);
      });

      expect(result.current.error).toBe('Network error');

      await act(async () => {
        result.current.retry();
      });

      expect(result.current.data).toEqual(mockPayload);
      expect(result.current.error).toBeNull();
      expect(weatherApi.fetchByCoords).toHaveBeenCalledTimes(2);
    });

    test('retry sem busca anterior nao faz nada', async () => {
      const { result } = renderHook(() => useWeather());

      await act(async () => {
        result.current.retry();
      });

      expect(weatherApi.fetchByCity).not.toHaveBeenCalled();
      expect(weatherApi.fetchByCoords).not.toHaveBeenCalled();
    });
  });
});
