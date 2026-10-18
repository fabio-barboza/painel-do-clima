const { geocodeCity, getForecast, CityNotFoundError } = require('../services/openMeteo');

const GEO_BASE = 'https://geocoding.test';
const FORECAST_BASE = 'https://forecast.test';

const geocodingResult = {
  name: 'São Paulo',
  latitude: -23.5475,
  longitude: -46.6361,
  country: 'Brasil',
  admin1: 'São Paulo',
  timezone: 'America/Sao_Paulo'
};

const forecastPayload = {
  latitude: -23.5475,
  longitude: -46.6361,
  timezone: 'America/Sao_Paulo',
  current: { temperature_2m: 18.3 },
  hourly: { time: ['2026-10-17T12:00'], temperature_2m: [18.3], precipitation: [0.0], uv_index: [4.1] },
  daily: { time: ['2026-10-17'], weather_code: [2], temperature_2m_min: [12.1], temperature_2m_max: [19.8], precipitation_sum: [0.0] }
};

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body)
  };
}

let fetchSpy;
let consoleLogSpy;

function logEntries() {
  return consoleLogSpy.mock.calls.map((call) => JSON.parse(call[0]));
}

describe('openMeteo service', () => {
  beforeEach(() => {
    process.env.GEOCODING_BASE_URL = GEO_BASE;
    process.env.FORECAST_BASE_URL = FORECAST_BASE;
    fetchSpy = jest.spyOn(global, 'fetch');
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    consoleLogSpy.mockRestore();
    delete process.env.GEOCODING_BASE_URL;
    delete process.env.FORECAST_BASE_URL;
    delete process.env.EXTERNAL_TIMEOUT_MS;
  });

  describe('geocodeCity', () => {
    it('retorna o results[0] como Location e envia language=pt e count=1', async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse(200, { results: [geocodingResult] }));

      const location = await geocodeCity('São Paulo');

      expect(location).toEqual({
        name: 'São Paulo',
        latitude: -23.5475,
        longitude: -46.6361,
        country: 'Brasil',
        admin1: 'São Paulo',
        timezone: 'America/Sao_Paulo'
      });
      const [url] = fetchSpy.mock.calls[0];
      expect(url).toBe(`${GEO_BASE}/v1/search?name=${encodeURIComponent('São Paulo')}&count=1&language=pt`);
    });

    it('lança CityNotFoundError quando results está vazio', async () => {
      fetchSpy
        .mockResolvedValueOnce(jsonResponse(200, { results: [] }))
        .mockResolvedValueOnce(jsonResponse(200, { results: [] }));

      await expect(geocodeCity('Cidade Inexistente')).rejects.toBeInstanceOf(CityNotFoundError);
      await expect(geocodeCity('Outra Inexistente')).rejects.toThrow("Cidade 'Outra Inexistente' não encontrada.");
    });

    it('lança CityNotFoundError quando a resposta não contém a chave results', async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse(200, {}));

      await expect(geocodeCity('Cidade Inexistente')).rejects.toBeInstanceOf(CityNotFoundError);
    });

    it('propaga erro quando a resposta externa é 400 ou 500', async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse(400, { error: 'Invalid parameter', reason: 'name' }));
      await expect(geocodeCity('São Paulo')).rejects.toThrow(/status 400/);

      fetchSpy.mockResolvedValueOnce(jsonResponse(500, {}));
      await expect(geocodeCity('São Paulo')).rejects.toThrow(/status 500/);
    });

    it('propaga falha de rede quando o fetch é rejeitado', async () => {
      fetchSpy.mockRejectedValueOnce(new Error('fetch failed'));

      await expect(geocodeCity('São Paulo')).rejects.toThrow('fetch failed');
    });

    it('aborta a chamada quando a API externa não responde (AbortController)', async () => {
      process.env.EXTERNAL_TIMEOUT_MS = '50';
      fetchSpy.mockImplementation((url, options) =>
        new Promise((resolve, reject) => {
          options.signal.addEventListener('abort', () => {
            const error = new Error('The operation was aborted');
            error.name = 'AbortError';
            reject(error);
          });
        })
      );

      await expect(geocodeCity('São Paulo')).rejects.toThrow(/Timeout \(50ms\)/);
      expect(fetchSpy.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
    });
  });

  describe('getForecast', () => {
    it('monta a URL com variáveis current/hourly/daily, timezone=auto, 24 horas, 7 dias e unidades métricas', async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse(200, forecastPayload));

      const payload = await getForecast(-23.5475, -46.6361);

      expect(payload).toBe(forecastPayload);
      const [url] = fetchSpy.mock.calls[0];
      expect(url.startsWith(`${FORECAST_BASE}/v1/forecast?`)).toBe(true);
      const params = new URLSearchParams(url.slice(url.indexOf('?') + 1));
      expect(params.get('latitude')).toBe('-23.5475');
      expect(params.get('longitude')).toBe('-46.6361');
      expect(params.get('current')).toBe('temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m');
      expect(params.get('hourly')).toBe('temperature_2m,precipitation,uv_index');
      expect(params.get('daily')).toBe('weather_code,temperature_2m_min,temperature_2m_max,precipitation_sum');
      expect(params.get('timezone')).toBe('auto');
      expect(params.get('forecast_hours')).toBe('24');
      expect(params.get('forecast_days')).toBe('7');
      expect(params.get('temperature_unit')).toBe('celsius');
      expect(params.get('wind_speed_unit')).toBe('kmh');
      expect(params.get('precipitation_unit')).toBe('mm');
    });

    it('propaga erro quando a resposta externa é 400 ou 500', async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse(400, { error: 'Invalid parameter', reason: 'latitude' }));
      await expect(getForecast(-23.5475, -46.6361)).rejects.toThrow(/status 400/);

      fetchSpy.mockResolvedValueOnce(jsonResponse(500, {}));
      await expect(getForecast(-23.5475, -46.6361)).rejects.toThrow(/status 500/);
    });

    it('propaga falha de rede quando o fetch é rejeitado', async () => {
      fetchSpy.mockRejectedValueOnce(new Error('ECONNREFUSED'));

      await expect(getForecast(-23.5475, -46.6361)).rejects.toThrow('ECONNREFUSED');
    });

    it('aborta a chamada quando a API externa não responde (AbortController)', async () => {
      process.env.EXTERNAL_TIMEOUT_MS = '50';
      fetchSpy.mockImplementation((url, options) =>
        new Promise((resolve, reject) => {
          options.signal.addEventListener('abort', () => {
            const error = new Error('The operation was aborted');
            error.name = 'AbortError';
            reject(error);
          });
        })
      );

      await expect(getForecast(-23.5475, -46.6361)).rejects.toThrow(/Timeout \(50ms\)/);
      expect(fetchSpy.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
    });
  });

  describe('logs das chamadas externas', () => {
    it('registra alvo, status e duração em chamada bem-sucedida', async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse(200, { results: [geocodingResult] }));

      await geocodeCity('São Paulo');

      expect(logEntries()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            level: 'debug',
            target: expect.stringContaining('/v1/search'),
            status: 200,
            durationMs: expect.any(Number)
          })
        ])
      );
    });

    it('registra em nível info quando NODE_ENV é production', async () => {
      process.env.NODE_ENV = 'production';
      fetchSpy.mockResolvedValueOnce(jsonResponse(200, { results: [geocodingResult] }));

      await geocodeCity('São Paulo');

      expect(logEntries()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ level: 'info', status: 200 })
        ])
      );
      delete process.env.NODE_ENV;
    });

    it('registra warn em resposta não-2xx e error em falha de rede/timeout', async () => {
      fetchSpy.mockResolvedValueOnce(jsonResponse(500, {}));
      await expect(getForecast(-23.5475, -46.6361)).rejects.toThrow();

      fetchSpy.mockRejectedValueOnce(new Error('fetch failed'));
      await expect(getForecast(-23.5475, -46.6361)).rejects.toThrow();

      const entries = logEntries();
      expect(entries.some((entry) => entry.level === 'warn' && entry.status === 500)).toBe(true);
      expect(entries.some((entry) => entry.level === 'error' && entry.error === 'fetch failed')).toBe(true);
    });
  });
});
