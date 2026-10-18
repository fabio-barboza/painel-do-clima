const express = require('express');
const request = require('supertest');
const { geocodeCity, getForecast, CityNotFoundError } = require('../services/openMeteo');
const router = require('../routes/weather');

jest.mock('../services/openMeteo', () => {
  class CityNotFoundError extends Error {
    constructor(city) {
      super(`Cidade '${city}' não encontrada.`);
      this.name = 'CityNotFoundError';
    }
  }
  return {
    geocodeCity: jest.fn(),
    getForecast: jest.fn(),
    CityNotFoundError
  };
});

const app = express();
app.use('/api/weather', router);

describe('GET /api/weather (rota, serviço mockado)', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    geocodeCity.mockReset();
    getForecast.mockReset();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('200 por city: encadeia geocoding e forecast com as coordenadas resolvidas', async () => {
    const location = {
      name: 'São Paulo',
      latitude: -23.5475,
      longitude: -46.6361,
      country: 'Brasil',
      admin1: 'São Paulo',
      timezone: 'America/Sao_Paulo'
    };
    const forecast = { latitude: -23.5475, longitude: -46.6361, timezone: 'America/Sao_Paulo' };
    geocodeCity.mockResolvedValueOnce(location);
    getForecast.mockResolvedValueOnce(forecast);

    const res = await request(app).get('/api/weather?city=São Paulo');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ location, forecast });
    expect(geocodeCity).toHaveBeenCalledWith('São Paulo');
    expect(getForecast).toHaveBeenCalledWith(-23.5475, -46.6361);
  });

  test('200 por lat/lon: forecast direto, location sem name', async () => {
    const forecast = { latitude: -23.5475, longitude: -46.6361, timezone: 'America/Sao_Paulo' };
    getForecast.mockResolvedValueOnce(forecast);

    const res = await request(app).get('/api/weather?lat=-23.5475&lon=-46.6361');

    expect(res.status).toBe(200);
    expect(res.body.location).toEqual({ latitude: -23.5475, longitude: -46.6361, timezone: 'America/Sao_Paulo' });
    expect(res.body.location).not.toHaveProperty('name');
    expect(res.body.forecast).toEqual(forecast);
    expect(geocodeCity).not.toHaveBeenCalled();
    expect(getForecast).toHaveBeenCalledWith(-23.5475, -46.6361);
  });

  test('400 VALIDATION quando city e coordenadas estão ausentes', async () => {
    const res = await request(app).get('/api/weather');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION');
    expect(res.body).toHaveProperty('message');
    expect(geocodeCity).not.toHaveBeenCalled();
    expect(getForecast).not.toHaveBeenCalled();
  });

  test('400 VALIDATION quando city e coordenadas estão presentes juntos', async () => {
    const res = await request(app).get('/api/weather?city=São Paulo&lat=-23&lon=-46');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION');
    expect(res.body).toHaveProperty('message');
    expect(geocodeCity).not.toHaveBeenCalled();
    expect(getForecast).not.toHaveBeenCalled();
  });

  test('400 VALIDATION para coordenadas não numéricas ou fora de domínio', async () => {
    const paths = [
      '/api/weather?lat=999&lon=-46',
      '/api/weather?lat=-23&lon=181',
      '/api/weather?lat=abc&lon=-46',
      '/api/weather?lat=-23&lon=abc',
      '/api/weather?lat=-23',
      '/api/weather?lon=-46'
    ];

    for (const path of paths) {
      const res = await request(app).get(path);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('VALIDATION');
    }
    expect(getForecast).not.toHaveBeenCalled();
  });

  test('404 CITY_NOT_FOUND quando o geocoding não encontra a cidade', async () => {
    geocodeCity.mockRejectedValueOnce(new CityNotFoundError('xyz'));

    const res = await request(app).get('/api/weather?city=xyz');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('CITY_NOT_FOUND');
    expect(res.body.message).toContain('xyz');
    expect(getForecast).not.toHaveBeenCalled();
  });

  test('500 INTERNAL quando o forecast falha', async () => {
    geocodeCity.mockResolvedValueOnce({ name: 'São Paulo', latitude: -23.5475, longitude: -46.6361 });
    getForecast.mockRejectedValueOnce(new Error('Falha ao consultar o serviço de previsão.'));

    const res = await request(app).get('/api/weather?city=São Paulo');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('INTERNAL');
    expect(res.body).toHaveProperty('message');
  });

  test('500 INTERNAL quando o geocoding falha com erro de rede', async () => {
    geocodeCity.mockRejectedValueOnce(new Error('fetch failed'));

    const res = await request(app).get('/api/weather?city=São Paulo');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('INTERNAL');
  });
});
