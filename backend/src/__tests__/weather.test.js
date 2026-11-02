const request = require('supertest');
const app = require('../app');

const NO_STORE = 'no-store';
const GEOCODING_PREFIX = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_PREFIX = 'https://api.open-meteo.com/v1/forecast';
const EXPECTED_GEOCODING_URL = `${GEOCODING_PREFIX}?name=Curitiba&count=1&language=pt&format=json`;
const EXPECTED_FORECAST_QUERY_FRAGMENT = 'latitude=-25.42778&longitude=-49.27306';
const EXPECTED_COORDINATES_FORECAST_FRAGMENT = 'latitude=-25.41&longitude=-49.24';
const HTTP_OK = 200;
const HTTP_SERVER_ERROR = 500;
const BAD_REQUEST_STATUS = 400;
const NOT_FOUND_STATUS = 404;
const UPSTREAM_STATUS = 502;
const CURITIBA_RESULT = {
  name: 'Curitiba',
  admin1: 'Paraná',
  country: 'Brasil',
  latitude: -25.42778,
  longitude: -49.27306
};
const FORECAST_BODY = {
  latitude: -25.42778,
  longitude: -49.27306,
  timezone: 'America/Sao_Paulo',
  utc_offset_seconds: -10800,
  current: {
    time: '2026-11-02T12:45',
    temperature_2m: 26.0,
    relative_humidity_2m: 61,
    apparent_temperature: 28.1,
    precipitation: 0.0,
    weather_code: 2,
    wind_speed_10m: 18.1,
    wind_direction_10m: 313,
    uv_index: 5.65
  },
  hourly: { time: ['2026-11-02T00:00'], temperature_2m: [20.1], precipitation: [0] },
  daily: {
    time: ['2026-11-02'],
    weather_code: [2],
    temperature_2m_max: [27.0],
    temperature_2m_min: [18.0],
    precipitation_sum: [0],
    precipitation_probability_max: [10]
  }
};

function createJsonResponse(body, status = HTTP_OK) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body
  };
}

function routeFetchByUrl(geocodingBody, forecastResponse) {
  return async (url) => {
    if (url.startsWith(GEOCODING_PREFIX)) {
      return createJsonResponse(geocodingBody);
    }
    return forecastResponse;
  };
}

describe('GET /api/weather', () => {
  let fetchSpy;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch');
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('success by city', () => {
    beforeEach(() => {
      fetchSpy.mockImplementation(routeFetchByUrl({ results: [CURITIBA_RESULT] }, createJsonResponse(FORECAST_BODY)));
    });

    test('should return the forecast payload with the resolved location', async () => {
      const response = await request(app).get('/api/weather').query({ city: 'Curitiba' }).expect(HTTP_OK);

      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toEqual({
        ...FORECAST_BODY,
        location: { name: 'Curitiba', region: 'Paraná', country: 'Brasil' }
      });
    });

    test('should call geocoding with the exact URL and then forecast with the resolved coordinates', async () => {
      await request(app).get('/api/weather').query({ city: 'Curitiba' }).expect(HTTP_OK);

      expect(fetchSpy).toHaveBeenCalledTimes(2);
      expect(fetchSpy.mock.calls[0][0]).toBe(EXPECTED_GEOCODING_URL);
      expect(fetchSpy.mock.calls[1][0]).toContain(FORECAST_PREFIX);
      expect(fetchSpy.mock.calls[1][0]).toContain(EXPECTED_FORECAST_QUERY_FRAGMENT);
      expect(fetchSpy.mock.calls[1][0]).toContain('timezone=auto');
    });

    test('should send no-store and no ETag', async () => {
      const response = await request(app).get('/api/weather').query({ city: 'Curitiba' }).expect(HTTP_OK);

      expect(response.headers['cache-control']).toBe(NO_STORE);
      expect(response.headers.etag).toBeUndefined();
    });
  });

  describe('success by coordinates', () => {
    test('should return the forecast with a null location and skip geocoding', async () => {
      fetchSpy.mockResolvedValue(createJsonResponse(FORECAST_BODY));

      const response = await request(app)
        .get('/api/weather')
        .query({ lat: '-25.41', lon: '-49.24' })
        .expect(HTTP_OK);

      expect(response.body).toEqual({
        ...FORECAST_BODY,
        location: { name: null, region: null, country: null }
      });
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy.mock.calls[0][0]).toContain(FORECAST_PREFIX);
      expect(fetchSpy.mock.calls[0][0]).toContain(EXPECTED_COORDINATES_FORECAST_FRAGMENT);
    });

    test('should send no-store and no ETag', async () => {
      fetchSpy.mockResolvedValue(createJsonResponse(FORECAST_BODY));

      const response = await request(app)
        .get('/api/weather')
        .query({ lat: '-25.41', lon: '-49.24' })
        .expect(HTTP_OK);

      expect(response.headers['cache-control']).toBe(NO_STORE);
      expect(response.headers.etag).toBeUndefined();
    });
  });

  describe('invalid parameters', () => {
    test('should answer 400 INVALID_PARAMS without calling any service', async () => {
      const response = await request(app).get('/api/weather').expect(BAD_REQUEST_STATUS);

      expect(response.body.error.code).toBe('INVALID_PARAMS');
      expect(response.headers['cache-control']).toBe(NO_STORE);
      expect(response.headers.etag).toBeUndefined();
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    test('should answer 400 INVALID_PARAMS for a city combined with coordinates', async () => {
      const response = await request(app)
        .get('/api/weather')
        .query({ city: 'Curitiba', lat: '-25.41', lon: '-49.24' })
        .expect(BAD_REQUEST_STATUS);

      expect(response.body.error.code).toBe('INVALID_PARAMS');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    test('should answer 400 INVALID_PARAMS for a repeated city', async () => {
      const response = await request(app)
        .get('/api/weather?city=Curitiba&city=Londrina')
        .expect(BAD_REQUEST_STATUS);

      expect(response.body.error.code).toBe('INVALID_PARAMS');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    test('should answer 400 INVALID_PARAMS for a latitude out of range', async () => {
      const response = await request(app)
        .get('/api/weather')
        .query({ lat: '95', lon: '0' })
        .expect(BAD_REQUEST_STATUS);

      expect(response.body.error.code).toBe('INVALID_PARAMS');
      expect(response.headers['cache-control']).toBe(NO_STORE);
    });
  });

  describe('city not found', () => {
    test('should answer 404 CITY_NOT_FOUND when geocoding has no results field', async () => {
      fetchSpy.mockResolvedValue(createJsonResponse({ generationtime_ms: 0.4 }));

      const response = await request(app).get('/api/weather').query({ city: 'Xyzzy' }).expect(NOT_FOUND_STATUS);

      expect(response.body).toEqual({
        error: { code: 'CITY_NOT_FOUND', message: 'Não encontramos essa cidade. Confira o nome e tente novamente.' }
      });
      expect(response.headers['cache-control']).toBe(NO_STORE);
      expect(response.headers.etag).toBeUndefined();
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('upstream failures', () => {
    test('should answer 502 UPSTREAM_ERROR without repeating the external message', async () => {
      fetchSpy.mockResolvedValue(createJsonResponse({ error: true, reason: 'Parameter latitude out of range' }, BAD_REQUEST_STATUS));

      const response = await request(app).get('/api/weather').query({ lat: '-25.41', lon: '-49.24' }).expect(UPSTREAM_STATUS);

      expect(response.body).toEqual({
        error: { code: 'UPSTREAM_ERROR', message: 'Não foi possível obter os dados do clima agora.' }
      });
      expect(response.headers['cache-control']).toBe(NO_STORE);
      expect(response.headers.etag).toBeUndefined();
    });

    test('should answer 502 when geocoding returns a server error', async () => {
      fetchSpy.mockResolvedValue(createJsonResponse({}, HTTP_SERVER_ERROR));

      const response = await request(app).get('/api/weather').query({ city: 'Curitiba' }).expect(UPSTREAM_STATUS);

      expect(response.body.error.code).toBe('UPSTREAM_ERROR');
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    test('should answer 502 UPSTREAM_ERROR when the forecast body has an unexpected shape', async () => {
      fetchSpy.mockResolvedValue(createJsonResponse({}));

      const response = await request(app).get('/api/weather').query({ lat: '-25.41', lon: '-49.24' }).expect(UPSTREAM_STATUS);

      expect(response.body).toEqual({
        error: { code: 'UPSTREAM_ERROR', message: 'Não foi possível obter os dados do clima agora.' }
      });
      expect(response.headers['cache-control']).toBe(NO_STORE);
      expect(response.headers.etag).toBeUndefined();
    });

    test('should answer 502 when the network request fails', async () => {
      fetchSpy.mockRejectedValue(new TypeError('fetch failed'));

      const response = await request(app).get('/api/weather').query({ lat: '0', lon: '0' }).expect(UPSTREAM_STATUS);

      expect(response.body.error.code).toBe('UPSTREAM_ERROR');
    });
  });
});
