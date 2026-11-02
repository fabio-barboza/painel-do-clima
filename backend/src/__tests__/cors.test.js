const { createCors, parseCorsOrigins } = require('../middleware/cors');

const ALLOWED_ORIGIN = 'http://localhost:5173';
const BLOCKED_ORIGIN = 'http://evil.example.com';
const CORS_HEADER_ORIGIN = 'Access-Control-Allow-Origin';
const CORS_HEADER_METHODS = 'Access-Control-Allow-Methods';
const CORS_HEADER_HEADERS = 'Access-Control-Allow-Headers';
const VARY_HEADER = 'Vary';
const PREFLIGHT_STATUS = 204;

function createFakeResponse() {
  const response = {
    headers: {},
    statusCode: 200,
    ended: false,
    setHeader(name, value) {
      response.headers[name] = value;
    },
    status(code) {
      response.statusCode = code;
      return response;
    },
    end() {
      response.ended = true;
      return response;
    }
  };
  return response;
}

function runCors(middleware, { method = 'GET', origin } = {}) {
  const request = { method, headers: origin ? { origin } : {} };
  const response = createFakeResponse();
  const next = jest.fn();
  middleware(request, response, next);
  return { response, next };
}

describe('parseCorsOrigins', () => {
  test('should return an empty list when the variable is missing', () => {
    expect(parseCorsOrigins(undefined)).toEqual([]);
  });

  test('should split, trim and drop empty entries', () => {
    expect(parseCorsOrigins(' http://a.test , ,http://b.test ')).toEqual([
      'http://a.test',
      'http://b.test'
    ]);
  });
});

describe('createCors', () => {
  test('should allow a listed origin and add Vary: Origin', () => {
    const middleware = createCors({ origins: [ALLOWED_ORIGIN], isProduction: false });
    const { response, next } = runCors(middleware, { origin: ALLOWED_ORIGIN });

    expect(response.headers[CORS_HEADER_ORIGIN]).toBe(ALLOWED_ORIGIN);
    expect(response.headers[VARY_HEADER]).toBe('Origin');
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('should not set an allow-origin header for a blocked origin', () => {
    const middleware = createCors({ origins: [ALLOWED_ORIGIN], isProduction: false });
    const { response, next } = runCors(middleware, { origin: BLOCKED_ORIGIN });

    expect(response.headers[CORS_HEADER_ORIGIN]).toBeUndefined();
    expect(response.headers[VARY_HEADER]).toBe('Origin');
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('should answer wildcard origin in development without a list', () => {
    const middleware = createCors({ origins: [], isProduction: false });
    const { response, next } = runCors(middleware, { origin: BLOCKED_ORIGIN });

    expect(response.headers[CORS_HEADER_ORIGIN]).toBe('*');
    expect(response.headers[VARY_HEADER]).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('should allow no origin in production without a list', () => {
    const middleware = createCors({ origins: [], isProduction: true });
    const { response, next } = runCors(middleware, { origin: ALLOWED_ORIGIN });

    expect(response.headers[CORS_HEADER_ORIGIN]).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('should answer preflight with 204 and the allowed methods and headers', () => {
    const middleware = createCors({ origins: [], isProduction: false });
    const { response, next } = runCors(middleware, { method: 'OPTIONS', origin: ALLOWED_ORIGIN });

    expect(response.statusCode).toBe(PREFLIGHT_STATUS);
    expect(response.ended).toBe(true);
    expect(response.headers[CORS_HEADER_METHODS]).toBe('GET, OPTIONS');
    expect(response.headers[CORS_HEADER_HEADERS]).toBe('Content-Type');
    expect(next).not.toHaveBeenCalled();
  });
});
