import { vi } from 'vitest';
import { weatherApi } from '../services/weatherApi';

describe('weatherApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockWeatherPayload = {
    location: { name: 'Sao Paulo', latitude: -23.55, longitude: -46.63, timezone: 'America/Sao_Paulo' },
    current: { temperature_2m: 20.9 },
    hourly: { time: ['2026-05-05T00:00'] },
    daily: { time: ['2026-05-05'] }
  };

  describe('fetchByCity', () => {
    test('retorna payload para cidade valida', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockWeatherPayload
      });

      const result = await weatherApi.fetchByCity('São Paulo');

      expect(result).toEqual(mockWeatherPayload);
      expect(global.fetch).toHaveBeenCalledWith('/api/weather?city=S%C3%A3o%20Paulo');
    });

    test('retorna payload para cidade com acento', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockWeatherPayload
      });

      await weatherApi.fetchByCity('São Paulo');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('city=')
      );
    });
  });

  describe('fetchByCoords', () => {
    test('retorna payload para coordenadas validas', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockWeatherPayload
      });

      const result = await weatherApi.fetchByCoords(-23.55, -46.63);

      expect(result).toEqual(mockWeatherPayload);
      expect(global.fetch).toHaveBeenCalledWith('/api/weather?lat=-23.55&lon=-46.63');
    });
  });

  describe('tratamento de erros', () => {
    test('lanca erro com mensagem para status 404', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        json: async () => ({ error: true, message: 'Cidade não encontrada' })
      });

      await expect(weatherApi.fetchByCity('InvalidCity')).rejects.toThrow('Cidade não encontrada');
    });

    test('lanca erro com mensagem para status 400', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        json: async () => ({ error: true, message: 'Parâmetros inválidos' })
      });

      await expect(weatherApi.fetchByCity('')).rejects.toThrow('Parâmetros inválidos');
    });

    test('lanca erro generico quando response nao possui message', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        json: async () => ({})
      });

      await expect(weatherApi.fetchByCity('test')).rejects.toThrow('Erro ao consultar o clima');
    });

    test('lanca erro de rede quando fetch falha', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(weatherApi.fetchByCity('São Paulo')).rejects.toThrow('Failed to fetch');
    });
  });
});
