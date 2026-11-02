const {
  geocodeCity,
  fetchForecast,
  buildGeocodingUrl,
  buildForecastUrl
} = require('../services/openMeteo');
const HttpError = require('../lib/httpError');

const EXPECTED_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search?name=Curitiba&count=1&language=pt&format=json';
const EXPECTED_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast?latitude=-25.41&longitude=-49.24&current=temperature_2m%2Crelative_humidity_2m%2Capparent_temperature%2Cprecipitation%2Cweather_code%2Cwind_speed_10m%2Cwind_direction_10m%2Cuv_index&hourly=temperature_2m%2Cprecipitation&daily=weather_code%2Ctemperature_2m_max%2Ctemperature_2m_min%2Cprecipitation_sum%2Cprecipitation_probability_max&timezone=auto&forecast_days=7';
const UPSTREAM_STATUS = 502;
const UPSTREAM_CODE = 'UPSTREAM_ERROR';
const HTTP_OK = 200;
const HTTP_SERVER_ERROR = 500;
const TIMEOUT_ERROR_NAME = 'TimeoutError';
const CURITIBA_RESULT = {
  name: 'Curitiba',
  admin1: 'Paraná',
  country: 'Brasil',
  latitude: -25.42778,
  longitude: -49.27306
};

function createJsonResponse(body, status = HTTP_OK) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body
  };
}

function createInvalidJsonResponse() {
  return {
    ok: true,
    status: HTTP_OK,
    json: async () => {
      throw new SyntaxError('Unexpected token');
    }
  };
}

function createTimeoutError() {
  const error = new Error('The operation was aborted due to timeout');
  error.name = TIMEOUT_ERROR_NAME;
  return error;
}

async function captureError(promise) {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  return undefined;
}

describe('openMeteo service', () => {
  let fetchSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch');
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('URL building', () => {
    test('should build the geocoding URL with encoded name and fixed parameters', () => {
      expect(buildGeocodingUrl('Curitiba')).toBe(EXPECTED_GEOCODING_URL);
    });

    test('should encode the city name', () => {
      expect(buildGeocodingUrl('São José dos Campos')).toBe(
        'https://geocoding-api.open-meteo.com/v1/search?name=S%C3%A3o+Jos%C3%A9+dos+Campos&count=1&language=pt&format=json'
      );
    });

    test('should build the forecast URL with coordinates and all requested variables', () => {
      expect(buildForecastUrl({ latitude: -25.41, longitude: -49.24 })).toBe(EXPECTED_FORECAST_URL);
    });
  });

  describe('geocodeCity', () => {
    test('should request the geocoding URL with a timeout signal and return the first result', async () => {
      fetchSpy.mockResolvedValue(createJsonResponse({ results: [CURITIBA_RESULT, { name: 'Curitiba', latitude: 0, longitude: 0 }] }));

      const place = await geocodeCity('Curitiba');

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(EXPECTED_GEOCODING_URL, { signal: expect.any(AbortSignal) });
      expect(place).toEqual({
        name: 'Curitiba',
        region: 'Paraná',
        country: 'Brasil',
        latitude: -25.42778,
        longitude: -49.27306
      });
    });

    test('should use the country as region when admin1 is missing', async () => {
      fetchSpy.mockResolvedValue(createJsonResponse({ results: [{ name: 'Lisboa', country: 'Portugal', latitude: 38.7, longitude: -9.1 }] }));

      const place = await geocodeCity('Lisboa');

      expect(place.region).toBe('Portugal');
      expect(place.country).toBe('Portugal');
    });

    test('should use null as region and country when admin1 and country are missing', async () => {
      fetchSpy.mockResolvedValue(createJsonResponse({ results: [{ name: 'Ilha', latitude: 1, longitude: 2 }] }));

      const place = await geocodeCity('Ilha');

      expect(place).toEqual({ name: 'Ilha', region: null, country: null, latitude: 1, longitude: 2 });
    });

    test('should return null when the response has no results field', async () => {
      fetchSpy.mockResolvedValue(createJsonResponse({ generationtime_ms: 0.5 }));

      await expect(geocodeCity('X')).resolves.toBeNull();
    });

    test('should return null when results is an empty list', async () => {
      fetchSpy.mockResolvedValue(createJsonResponse({ results: [] }));

      await expect(geocodeCity('Nenhuma')).resolves.toBeNull();
    });

    test('should throw 502 UPSTREAM_ERROR on a non 2xx status and log the service and status', async () => {
      fetchSpy.mockResolvedValue(createJsonResponse({ error: true }, HTTP_SERVER_ERROR));

      const error = await captureError(geocodeCity('Curitiba'));

      expect(error).toBeInstanceOf(HttpError);
      expect(error.status).toBe(UPSTREAM_STATUS);
      expect(error.code).toBe(UPSTREAM_CODE);
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('geocoding: status 500'));
    });

    test('should throw 502 UPSTREAM_ERROR on timeout', async () => {
      fetchSpy.mockRejectedValue(createTimeoutError());

      const error = await captureError(geocodeCity('Curitiba'));

      expect(error.status).toBe(UPSTREAM_STATUS);
      expect(error.code).toBe(UPSTREAM_CODE);
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('TimeoutError'));
    });

    test('should throw 502 UPSTREAM_ERROR on network failure', async () => {
      fetchSpy.mockRejectedValue(new TypeError('fetch failed'));

      const error = await captureError(geocodeCity('Curitiba'));

      expect(error.status).toBe(UPSTREAM_STATUS);
      expect(error.code).toBe(UPSTREAM_CODE);
    });

    test('should throw 502 UPSTREAM_ERROR on invalid JSON without repeating the external message', async () => {
      fetchSpy.mockResolvedValue(createInvalidJsonResponse());

      const error = await captureError(geocodeCity('Curitiba'));

      expect(error.status).toBe(UPSTREAM_STATUS);
      expect(error.message).toBe('Não foi possível obter os dados do clima agora.');
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('SyntaxError'));
    });

    test('should throw 502 UPSTREAM_ERROR when the JSON body is null', async () => {
      fetchSpy.mockResolvedValue(createJsonResponse(null));

      const error = await captureError(geocodeCity('Curitiba'));

      expect(error.status).toBe(UPSTREAM_STATUS);
    });
  });

  describe('fetchForecast', () => {
    test('should request the forecast URL with a timeout signal and return the body unchanged', async () => {
      const forecastBody = { latitude: -25.41, timezone: 'America/Sao_Paulo', current: { uv_index: 5.65 }, hourly: {}, daily: {} };
      fetchSpy.mockResolvedValue(createJsonResponse(forecastBody));

      const forecast = await fetchForecast({ latitude: -25.41, longitude: -49.24 });

      expect(fetchSpy).toHaveBeenCalledWith(EXPECTED_FORECAST_URL, { signal: expect.any(AbortSignal) });
      expect(forecast).toEqual(forecastBody);
    });

    test('should throw 502 without logging the coordinates on a non 2xx status', async () => {
      fetchSpy.mockResolvedValue(createJsonResponse({ error: true, reason: 'bad' }, 400));

      const error = await captureError(fetchForecast({ latitude: -25.41, longitude: -49.24 }));

      expect(error.status).toBe(UPSTREAM_STATUS);
      expect(error.code).toBe(UPSTREAM_CODE);
      const loggedMessage = consoleErrorSpy.mock.calls.map((call) => call.join(' ')).join(' ');
      expect(loggedMessage).toContain('forecast: status 400');
      expect(loggedMessage).not.toContain('-25.41');
      expect(loggedMessage).not.toContain('-49.24');
    });

    test('should throw 502 UPSTREAM_ERROR on timeout', async () => {
      fetchSpy.mockRejectedValue(createTimeoutError());

      const error = await captureError(fetchForecast({ latitude: 0, longitude: 0 }));

      expect(error.status).toBe(UPSTREAM_STATUS);
      expect(error.code).toBe(UPSTREAM_CODE);
    });

    test('should throw 502 UPSTREAM_ERROR on invalid JSON', async () => {
      fetchSpy.mockResolvedValue(createInvalidJsonResponse());

      const error = await captureError(fetchForecast({ latitude: 0, longitude: 0 }));

      expect(error.status).toBe(UPSTREAM_STATUS);
      expect(error.code).toBe(UPSTREAM_CODE);
    });

    test.each([
      ['an empty object', {}],
      ['an array', [{ current: {}, hourly: {}, daily: {} }]],
      ['a missing current', { hourly: {}, daily: {} }],
      ['a missing hourly', { current: {}, daily: {} }],
      ['a missing daily', { current: {}, hourly: {} }],
      ['a null current', { current: null, hourly: {}, daily: {} }],
      ['a string daily', { current: {}, hourly: {}, daily: 'x' }],
      ['an array hourly', { current: {}, hourly: [], daily: {} }]
    ])('should throw 502 UPSTREAM_ERROR with invalid payload reason when the body is %s', async (_label, body) => {
      fetchSpy.mockResolvedValue(createJsonResponse(body));

      const error = await captureError(fetchForecast({ latitude: 0, longitude: 0 }));

      expect(error).toBeInstanceOf(HttpError);
      expect(error.status).toBe(UPSTREAM_STATUS);
      expect(error.code).toBe(UPSTREAM_CODE);
      expect(error.message).toBe('Não foi possível obter os dados do clima agora.');
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('forecast: payload inválido'));
    });

    test('should accept a forecast body with current, hourly and daily objects', async () => {
      const forecastBody = { current: {}, hourly: {}, daily: {} };
      fetchSpy.mockResolvedValue(createJsonResponse(forecastBody));

      await expect(fetchForecast({ latitude: 0, longitude: 0 })).resolves.toEqual(forecastBody);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });
});
