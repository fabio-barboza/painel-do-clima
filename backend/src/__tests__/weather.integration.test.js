const request = require('supertest');
const createApp = require('../app');
const geocodingFixture = require('./fixtures/geocoding-sao-paulo');
const forecastFixture = require('./fixtures/forecast');

const GEO_BASE = 'https://geocoding.test';
const FORECAST_BASE = 'https://forecast.test';

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body)
  };
}

const app = createApp();

describe('GET /api/weather (integração, apenas global.fetch mockado)', () => {
  let fetchMock;

  function fetchCalls() {
    return fetchMock.mock.calls.map((call) => String(call[0]));
  }

  function forecastUrl() {
    return fetchCalls().find((url) => url.startsWith(FORECAST_BASE));
  }

  beforeEach(() => {
    process.env.NODE_ENV = 'development';
    process.env.GEOCODING_BASE_URL = GEO_BASE;
    process.env.FORECAST_BASE_URL = FORECAST_BASE;
    fetchMock = jest.spyOn(global, 'fetch');
    fetchMock.mockImplementation((url) => {
      if (String(url).startsWith(GEO_BASE)) {
        return Promise.resolve(jsonResponse(200, geocodingFixture));
      }
      return Promise.resolve(jsonResponse(200, forecastFixture));
    });
  });

  afterEach(() => {
    fetchMock.mockRestore();
    delete process.env.GEOCODING_BASE_URL;
    delete process.env.FORECAST_BASE_URL;
    delete process.env.NODE_ENV;
  });

  test('200 por city: encadeia geocoding e forecast com as coordenadas do geocoding', async () => {
    const res = await request(app).get('/api/weather?city=São Paulo');

    expect(res.status).toBe(200);
    expect(res.body.location).toEqual({
      name: 'São Paulo',
      latitude: -23.5475,
      longitude: -46.6361,
      country: 'Brasil',
      admin1: 'São Paulo',
      timezone: 'America/Sao_Paulo'
    });
    expect(res.body.forecast).toEqual(forecastFixture);

    const forecastCall = forecastUrl();
    expect(forecastCall).toBeDefined();
    const params = new URLSearchParams(forecastCall.slice(forecastCall.indexOf('?') + 1));
    expect(params.get('latitude')).toBe('-23.5475');
    expect(params.get('longitude')).toBe('-46.6361');
    expect(params.get('timezone')).toBe('auto');
  });

  test('200 por lat/lon: forecast direto sem geocoding, location sem name', async () => {
    const res = await request(app).get('/api/weather?lat=-23.5475&lon=-46.6361');

    expect(res.status).toBe(200);
    expect(res.body.location).toEqual({
      latitude: -23.5475,
      longitude: -46.6361,
      timezone: forecastFixture.timezone
    });
    expect(res.body.location).not.toHaveProperty('name');
    expect(fetchCalls().some((url) => url.startsWith(GEO_BASE))).toBe(false);
  });

  test('respostas 200 carregam no-cache, sem ETag e headers CORS', async () => {
    const res = await request(app).get('/api/weather?city=São Paulo');

    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.headers.etag).toBeUndefined();
    expect(res.headers['access-control-allow-origin']).toBe('*');
    expect(res.headers['access-control-allow-methods']).toBe('GET');
  });

  test('400 VALIDATION quando parâmetros estão ausentes', async () => {
    const res = await request(app).get('/api/weather');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION');
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.headers.etag).toBeUndefined();
    expect(res.headers['access-control-allow-origin']).toBe('*');
    expect(fetchCalls()).toHaveLength(0);
  });

  test('404 CITY_NOT_FOUND quando o geocoding retorna results vazio', async () => {
    fetchMock.mockImplementation((url) => {
      if (String(url).startsWith(GEO_BASE)) {
        return Promise.resolve(jsonResponse(200, { results: [] }));
      }
      return Promise.resolve(jsonResponse(200, forecastFixture));
    });

    const res = await request(app).get('/api/weather?city=Cidade Inexistente');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('CITY_NOT_FOUND');
    expect(res.body).toHaveProperty('message');
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.headers.etag).toBeUndefined();
    expect(res.headers['access-control-allow-origin']).toBe('*');
  });

  test('500 INTERNAL quando o forecast responde não-200', async () => {
    fetchMock.mockImplementation((url) => {
      if (String(url).startsWith(GEO_BASE)) {
        return Promise.resolve(jsonResponse(200, geocodingFixture));
      }
      return Promise.resolve(jsonResponse(500, { reason: 'internal' }));
    });

    const res = await request(app).get('/api/weather?city=São Paulo');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('INTERNAL');
    expect(res.body).toHaveProperty('message');
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.headers.etag).toBeUndefined();
    expect(res.headers['access-control-allow-origin']).toBe('*');
  });
});
