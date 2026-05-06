const { getForecast } = require('../services/forecast');

describe('forecast service', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  const mockForecastResponse = {
    latitude: -23.5475,
    longitude: -46.63611,
    timezone: 'America/Sao_Paulo',
    current: {
      temperature_2m: 20.9,
      relative_humidity_2m: 81,
      wind_speed_10m: 4.9,
      weather_code: 0,
      precipitation: 0.0,
      is_day: 1
    },
    current_units: {},
    hourly: {
      time: ['2026-05-05T00:00'],
      temperature_2m: [19.0],
      precipitation: [0.0]
    },
    hourly_units: {},
    daily: {
      time: ['2026-05-05'],
      weather_code: [0],
      temperature_2m_max: [27.2],
      temperature_2m_min: [16.1],
      uv_index_max: [6.2],
      precipitation_sum: [1.5]
    },
    daily_units: {}
  };

  describe('sucesso', () => {
    test('retorna payload de forecast para coordenadas validas', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockForecastResponse
      });

      const result = await getForecast(-23.5475, -46.63611);

      expect(result).toEqual(mockForecastResponse);
      expect(result.current).toBeDefined();
      expect(result.hourly).toBeDefined();
      expect(result.daily).toBeDefined();
    });

    test('chama API com parametros corretos', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => mockForecastResponse
      });

      await getForecast(-23.5475, -46.63611);

      const calledUrl = global.fetch.mock.calls[0][0];
      expect(calledUrl).toContain('latitude=-23.5475');
      expect(calledUrl).toContain('longitude=-46.63611');
      expect(calledUrl).toContain('timezone=auto');
      expect(calledUrl).toContain('forecast_days=7');
      expect(calledUrl).toContain('current=');
      expect(calledUrl).toContain('hourly=');
      expect(calledUrl).toContain('daily=');
    });
  });

  describe('erro de API', () => {
    test('lanca erro quando fetch falha', async () => {
      jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

      await expect(getForecast(-23.5475, -46.63611)).rejects.toThrow('Network error');
    });

    test('lanca erro quando resposta nao e ok', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 500
      });

      await expect(getForecast(-23.5475, -46.63611)).rejects.toThrow('Erro ao consultar API de forecast: 500');
    });
  });
});
