process.env.NODE_ENV = 'development';
process.env.CORS_ORIGINS = '*';

jest.mock('../../src/services/geocoding');
jest.mock('../../src/services/reverseGeocoding');
jest.mock('../../src/services/forecast', () => {
  const actual = jest.requireActual('../../src/services/forecast');
  return { fetchForecast: jest.fn(), sliceHourly24: actual.sliceHourly24 };
});

const request = require('supertest');
const app = require('../../src/index');
const { geocodeCity } = require('../../src/services/geocoding');
const { fetchForecast } = require('../../src/services/forecast');
const { reverseGeocode } = require('../../src/services/reverseGeocoding');
const ExternalError = require('../../src/services/externalError');

function buildForecast(currentLocal = '2026-10-27T13:30') {
  const time = [];
  const temperature_2m = [];
  const precipitation = [];
  const weather_code = [];
  for (let i = 0; i < 48; i += 1) {
    const day = 27 + Math.floor(i / 24);
    const hour = String(i % 24).padStart(2, '0');
    time.push(`2026-10-${day}T${hour}:00`);
    temperature_2m.push(15 + (i % 5));
    precipitation.push(i % 3);
    weather_code.push(0);
  }

  const dayTime = [];
  const max = [];
  const min = [];
  const prob = [];
  const sum = [];
  const code = [];
  for (let d = 0; d < 7; d += 1) {
    dayTime.push(`2026-10-${27 + d}T00:00`);
    max.push(22 + d);
    min.push(10 + d);
    prob.push(d % 2 === 0 ? 40 + d : null);
    sum.push(d % 2);
    code.push(0);
  }

  return {
    timezone: 'America/Sao_Paulo',
    utc_offset_seconds: -10800,
    current: {
      time: currentLocal,
      temperature_2m: 20,
      relative_humidity_2m: 70,
      apparent_temperature: 19,
      precipitation: 0,
      weather_code: 1,
      wind_speed_10m: 12,
      wind_direction_10m: 180,
      uv_index: 3
    },
    hourly: { time, temperature_2m, precipitation, weather_code },
    daily: {
      time: dayTime,
      temperature_2m_max: max,
      temperature_2m_min: min,
      precipitation_probability_max: prob,
      precipitation_sum: sum,
      weather_code: code
    }
  };
}

beforeEach(() => {
  geocodeCity.mockReset();
  fetchForecast.mockReset();
  reverseGeocode.mockReset();
});

describe('GET /api/weather — validação (400)', () => {
  test('sem parâmetros -> 400 { error }', async () => {
    const res = await request(app).get('/api/weather');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.headers['cache-control']).toBe('no-store');
    expect(fetchForecast).not.toHaveBeenCalled();
  });

  test('city vazio -> 400 { error }', async () => {
    const res = await request(app).get('/api/weather').query({ city: '' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('city só espaços -> 400 { error }', async () => {
    const res = await request(app).get('/api/weather').query({ city: '   ' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('latitude inválida (NaN) -> 400 { error }', async () => {
    const res = await request(app).get('/api/weather').query({ latitude: 'abc', longitude: '5' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('latitude fora do range -> 400 { error }', async () => {
    const res = await request(app).get('/api/weather').query({ latitude: '120', longitude: '5' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('longitude fora do range -> 400 { error }', async () => {
    const res = await request(app).get('/api/weather').query({ latitude: '5', longitude: '200' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('coordenada única (latitude) -> 400 { error }, sem fetchForecast', async () => {
    const res = await request(app).get('/api/weather').query({ latitude: '10' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(fetchForecast).not.toHaveBeenCalled();
  });

  test('coordenada única (longitude) -> 400 { error }, sem fetchForecast', async () => {
    const res = await request(app).get('/api/weather').query({ longitude: '20' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(fetchForecast).not.toHaveBeenCalled();
  });

  test('city + coordenadas juntos -> 400 { error }', async () => {
    const res = await request(app)
      .get('/api/weather')
      .query({ city: 'Curitiba', latitude: '-25.43', longitude: '-49.27' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(geocodeCity).not.toHaveBeenCalled();
    expect(fetchForecast).not.toHaveBeenCalled();
  });

  test('todos os 400 respondem JSON { error } em pt-BR com no-store', async () => {
    const cases = [
      {},
      { city: '' },
      { city: '   ' },
      { latitude: 'x', longitude: '1' },
      { latitude: '91', longitude: '1' },
      { latitude: '1', longitude: '-181' },
      { city: 'Curitiba', latitude: '1', longitude: '2' }
    ];
    for (const q of cases) {
      const res = await request(app).get('/api/weather').query(q);
      expect(res.status).toBe(400);
      expect(typeof res.body.error).toBe('string');
      expect(res.body.error.length).toBeGreaterThan(0);
      expect(res.headers['cache-control']).toBe('no-store');
      expect(res.headers['etag']).toBeUndefined();
    }
  });
});

describe('GET /api/weather — fluxo por cidade (200/404/502)', () => {
  test('200 city: envelope completo, display "Curitiba, Paraná", 24h e 7 dias, headers', async () => {
    geocodeCity.mockResolvedValue({
      name: 'Curitiba',
      region: 'Paraná',
      country: 'Brasil',
      latitude: -25.43,
      longitude: -49.27
    });
    fetchForecast.mockResolvedValue(buildForecast('2026-10-27T13:30'));

    const res = await request(app)
      .get('/api/weather')
      .query({ city: 'Curitiba' })
      .set('Origin', 'http://example.com');

    expect(res.status).toBe(200);
    expect(res.body.city.display).toBe('Curitiba, Paraná');
    expect(res.body.city.name).toBe('Curitiba');
    expect(res.body.city.region).toBe('Paraná');
    expect(res.body.city.latitude).toBe(-25.43);

    expect(res.body.hourly.time).toHaveLength(24);
    expect(res.body.hourly.time[0]).toBe('2026-10-27T13:00');
    expect(res.body.hourly.temperature_2m).toHaveLength(24);
    expect(res.body.daily.time).toHaveLength(7);

    expect(res.body.timezone).toBe('America/Sao_Paulo');
    expect(res.body.current.temperature_2m).toBe(20);

    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.headers['etag']).toBeUndefined();
    expect(res.headers['access-control-allow-origin']).toBe('http://example.com');
    expect(res.headers['access-control-allow-methods']).toBe('GET, OPTIONS');
  });

  test('city com acento/maiúsculas é trimmado e enviado', async () => {
    geocodeCity.mockResolvedValue({ name: 'São Paulo', admin1: 'São Paulo', country: 'Brasil', latitude: -23, longitude: -46 });
    fetchForecast.mockResolvedValue(buildForecast());

    const res = await request(app).get('/api/weather').query({ city: '  SAO PAULO ' });

    expect(res.status).toBe(200);
    expect(geocodeCity).toHaveBeenCalledWith('SAO PAULO');
    expect(res.body.city.display).toBe('São Paulo');
  });

  test('404: geocoding vazio -> { error: "Cidade não encontrada." }', async () => {
    geocodeCity.mockResolvedValue(null);
    fetchForecast.mockResolvedValue(buildForecast());

    const res = await request(app).get('/api/weather').query({ city: 'CidadeInexistente' });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Cidade não encontrada.');
    expect(res.headers['cache-control']).toBe('no-store');
  });

  test('502: forecast rejeita (ExternalError) -> { error }', async () => {
    geocodeCity.mockResolvedValue({ name: 'Curitiba', region: 'Paraná', country: 'Brasil', latitude: -25.43, longitude: -49.27 });
    fetchForecast.mockRejectedValue(new ExternalError('Falha na consulta de previsão.', 502));

    const res = await request(app).get('/api/weather').query({ city: 'Curitiba' });
    expect(res.status).toBe(502);
    expect(res.body).toHaveProperty('error');
    expect(res.headers['cache-control']).toBe('no-store');
  });
});

describe('GET /api/weather — fluxo por coordenadas (200, paralelo)', () => {
  test('200 geo: nome resolvido via reverse, envelope completo', async () => {
    fetchForecast.mockResolvedValue(buildForecast('2026-10-27T09:30'));
    reverseGeocode.mockResolvedValue({ name: 'Curitiba', region: 'Paraná' });

    const res = await request(app).get('/api/weather').query({ latitude: '-25.43', longitude: '-49.27' });

    expect(res.status).toBe(200);
    expect(res.body.city.name).toBe('Curitiba');
    expect(res.body.city.region).toBe('Paraná');
    expect(res.body.hourly.time).toHaveLength(24);
    expect(res.body.hourly.time[0]).toBe('2026-10-27T09:00');
    expect(fetchForecast).toHaveBeenCalledTimes(1);
    expect(reverseGeocode).toHaveBeenCalledTimes(1);
  });

  test('200 geo: reverse falha -> city.name null, ainda 200', async () => {
    fetchForecast.mockResolvedValue(buildForecast());
    reverseGeocode.mockResolvedValue(null);

    const res = await request(app).get('/api/weather').query({ latitude: '-25.43', longitude: '-49.27' });

    expect(res.status).toBe(200);
    expect(res.body.city.name).toBeNull();
    expect(res.body.city.display).toBeNull();
    expect(fetchForecast).toHaveBeenCalledTimes(1);
  });

  test('forecast e reverse executados em paralelo (Promise.all)', async () => {
    let resolveForecast;
    const forecastGate = new Promise((resolve) => { resolveForecast = resolve; });
    let resolveReverse;
    const reverseGate = new Promise((resolve) => { resolveReverse = resolve; });

    fetchForecast.mockImplementation(() => forecastGate);
    reverseGeocode.mockImplementation(() => reverseGate);

    const pending = request(app).get('/api/weather').query({ latitude: '-25.43', longitude: '-49.27' });

    const startedAt = Date.now();
    resolveForecast(buildForecast());
    resolveReverse({ name: 'Curitiba', region: 'Paraná' });
    const res = await pending;

    expect(res.status).toBe(200);
    expect(Date.now() - startedAt).toBeLessThan(1000);
  });
});

describe('GET /api/weather — CORS preflight', () => {
  test('OPTIONS /api/weather -> 204 com allow-* e eco da origem', async () => {
    const res = await request(app).options('/api/weather').set('Origin', 'http://frontend.dev');
    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('http://frontend.dev');
    expect(res.headers['access-control-allow-methods']).toBe('GET, OPTIONS');
    expect(res.headers['cache-control']).toBe('no-store');
  });
});

describe('GET /api/weather — headers em todos os status', () => {
  test('cache-control: no-store presente em 200, 400, 404, 502', async () => {
    geocodeCity.mockResolvedValue({ name: 'Curitiba', region: 'Paraná', country: 'Brasil', latitude: -25.43, longitude: -49.27 });
    fetchForecast.mockResolvedValue(buildForecast());

    const ok = await request(app).get('/api/weather').query({ city: 'Curitiba' });
    expect(ok.headers['cache-control']).toBe('no-store');

    const bad = await request(app).get('/api/weather');
    expect(bad.headers['cache-control']).toBe('no-store');

    geocodeCity.mockResolvedValue(null);
    const notFound = await request(app).get('/api/weather').query({ city: 'Nada' });
    expect(notFound.status).toBe(404);
    expect(notFound.headers['cache-control']).toBe('no-store');

    geocodeCity.mockResolvedValue({ name: 'Curitiba', region: 'Paraná', country: 'Brasil', latitude: -25.43, longitude: -49.27 });
    fetchForecast.mockRejectedValue(new ExternalError('falha', 502));
    const boom = await request(app).get('/api/weather').query({ city: 'Curitiba' });
    expect(boom.status).toBe(502);
    expect(boom.headers['cache-control']).toBe('no-store');
  });
});

describe('Rota desconhecida continua intacta', () => {
  test('404 JSON { error }', async () => {
    const res = await request(app).get('/rota-desconhecida');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.headers['cache-control']).toBe('no-store');
    expect(geocodeCity).not.toHaveBeenCalled();
  });
});
