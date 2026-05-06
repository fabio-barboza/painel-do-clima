const request = require('supertest');
const app = require('../index');
const { geocode } = require('../services/geocoding');
const { getForecast } = require('../services/forecast');

jest.mock('../services/geocoding');
jest.mock('../services/forecast');

const mockGeocodeResult = {
  name: 'São Paulo',
  latitude: -23.5475,
  longitude: -46.63611,
  timezone: 'America/Sao_Paulo'
};

const mockForecastResult = {
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
  current_units: { temperature_2m: '°C' },
  hourly: {
    time: ['2026-05-05T00:00', '2026-05-05T01:00'],
    temperature_2m: [19.0, 18.5],
    precipitation: [0.0, 0.0]
  },
  hourly_units: { temperature_2m: '°C' },
  daily: {
    time: ['2026-05-05', '2026-05-06'],
    weather_code: [0, 3],
    temperature_2m_max: [27.2, 25.0],
    temperature_2m_min: [16.1, 15.0],
    uv_index_max: [6.2, 4.0],
    precipitation_sum: [1.5, 0.0]
  },
  daily_units: { temperature_2m_max: '°C' }
};

describe('GET /api/weather', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('busca por cidade', () => {
    test('retorna 200 com payload completo para cidade valida', async () => {
      geocode.mockResolvedValue(mockGeocodeResult);
      getForecast.mockResolvedValue(mockForecastResult);

      const response = await request(app)
        .get('/api/weather?city=São Paulo')
        .expect(200);

      expect(response.body.location).toEqual({
        name: 'São Paulo',
        latitude: -23.5475,
        longitude: -46.63611,
        timezone: 'America/Sao_Paulo'
      });
      expect(response.body.current).toBeDefined();
      expect(response.body.hourly).toBeDefined();
      expect(response.body.daily).toBeDefined();
      expect(response.body.current_units).toBeDefined();
      expect(response.body.hourly_units).toBeDefined();
      expect(response.body.daily_units).toBeDefined();
    });

    test('retorna 404 para cidade inexistente', async () => {
      const notFoundError = new Error('Cidade não encontrada');
      notFoundError.statusCode = 404;
      geocode.mockRejectedValue(notFoundError);

      const response = await request(app)
        .get('/api/weather?city=CidadeInexistenteXYZ')
        .expect(404);

      expect(response.body).toEqual({
        error: true,
        message: 'Cidade não encontrada'
      });
    });

    test('retorna 400 para city vazio', async () => {
      const response = await request(app)
        .get('/api/weather?city=')
        .expect(400);

      expect(response.body).toEqual({
        error: true,
        message: 'Parâmetros inválidos'
      });
    });

    test('retorna 400 para city com apenas espacos', async () => {
      const response = await request(app)
        .get('/api/weather?city=%20%20%20')
        .expect(400);

      expect(response.body).toEqual({
        error: true,
        message: 'Parâmetros inválidos'
      });
    });
  });

  describe('busca por coordenadas', () => {
    test('retorna 200 com payload para coordenadas validas', async () => {
      getForecast.mockResolvedValue(mockForecastResult);

      const response = await request(app)
        .get('/api/weather?lat=-23.55&lon=-46.63')
        .expect(200);

      expect(response.body.location).toBeDefined();
      expect(response.body.location.latitude).toBe(-23.5475);
      expect(response.body.location.timezone).toBe('America/Sao_Paulo');
      expect(response.body.current).toBeDefined();
      expect(response.body.hourly).toBeDefined();
      expect(response.body.daily).toBeDefined();
      expect(response.body.location.name).toBeUndefined();
    });

    test('retorna 400 para latitude invalida', async () => {
      const response = await request(app)
        .get('/api/weather?lat=abc&lon=-46.63')
        .expect(400);

      expect(response.body).toEqual({
        error: true,
        message: 'Parâmetros inválidos'
      });
    });

    test('retorna 400 para longitude ausente', async () => {
      const response = await request(app)
        .get('/api/weather?lat=-23.55')
        .expect(400);

      expect(response.body).toEqual({
        error: true,
        message: 'Parâmetros inválidos'
      });
    });

    test('retorna 400 para latitude fora do range', async () => {
      const response = await request(app)
        .get('/api/weather?lat=91&lon=-46.63')
        .expect(400);

      expect(response.body).toEqual({
        error: true,
        message: 'Parâmetros inválidos'
      });
    });
  });

  describe('validacao de parametros', () => {
    test('retorna 400 sem parametros', async () => {
      const response = await request(app)
        .get('/api/weather')
        .expect(400);

      expect(response.body).toEqual({
        error: true,
        message: 'Parâmetros inválidos'
      });
    });
  });

  describe('erros internos', () => {
    test('retorna 500 quando forecast falha', async () => {
      geocode.mockResolvedValue(mockGeocodeResult);
      getForecast.mockRejectedValue(new Error('Network error'));

      const response = await request(app)
        .get('/api/weather?city=São Paulo')
        .expect(500);

      expect(response.body).toEqual({
        error: true,
        message: 'Erro ao consultar o clima'
      });
    });
  });
});
