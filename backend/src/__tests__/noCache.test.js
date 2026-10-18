const request = require('supertest');
const createApp = require('../app');
const { errorHandler } = require('../middleware/errorHandler');

const ORIGINAL_ENV = { ...process.env };

function restoreEnv() {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) {
      delete process.env[key];
    }
  }
  for (const key of Object.keys(ORIGINAL_ENV)) {
    process.env[key] = ORIGINAL_ENV[key];
  }
}

const app = createApp();

describe('No-cache and CORS', () => {
  afterEach(restoreEnv);

  test('200 responses carry Cache-Control: no-store and no ETag', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.headers.etag).toBeUndefined();
  });

  test('error (404) responses carry Cache-Control: no-store and no ETag', async () => {
    const res = await request(app).get('/no-such-route');
    expect(res.status).toBe(404);
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.headers.etag).toBeUndefined();
  });

  test('404 unknown route returns the JSON contract', async () => {
    const res = await request(app).get('/no-such-route');
    expect(res.status).toBe(404);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toHaveProperty('error');
    expect(res.body).toHaveProperty('message');
  });

  describe('CORS', () => {
    test('development accepts any origin', async () => {
      process.env.NODE_ENV = 'development';
      const res = await request(app).get('/health');
      expect(res.headers['access-control-allow-origin']).toBe('*');
    });

    test('production echoes an allowed origin', async () => {
      process.env.NODE_ENV = 'production';
      process.env.CORS_ORIGINS = 'https://app.example.com';
      const res = await request(app)
        .get('/health')
        .set('Origin', 'https://app.example.com');
      expect(res.headers['access-control-allow-origin']).toBe('https://app.example.com');
    });

    test('production rejects a disallowed origin', async () => {
      process.env.NODE_ENV = 'production';
      process.env.CORS_ORIGINS = 'https://app.example.com';
      const res = await request(app)
        .get('/health')
        .set('Origin', 'https://evil.com');
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });

    test('always advertises GET method and allowed headers', async () => {
      process.env.NODE_ENV = 'development';
      const res = await request(app).get('/health');
      expect(res.headers['access-control-allow-methods']).toBe('GET');
      expect(res.headers['access-control-allow-headers']).toContain('Content-Type');
      expect(res.headers['access-control-allow-headers']).toContain('Accept');
    });

    test('answers the CORS preflight with 204', async () => {
      process.env.NODE_ENV = 'development';
      const res = await request(app)
        .options('/health')
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'GET');
      expect(res.status).toBe(204);
      expect(res.headers['access-control-allow-origin']).toBe('*');
    });
  });
});

describe('Error handler (500)', () => {
  function mockRes() {
    const res = {
      statusCode: 200,
      headers: {},
      body: undefined,
      setHeader(key, value) {
        this.headers[key] = value;
      },
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
        return this;
      }
    };
    return res;
  }

  function mockReq() {
    return { method: 'GET', originalUrl: '/boom', query: {}, params: {} };
  }

  test('responds 500 JSON without leaking the stack', () => {
    const res = mockRes();
    errorHandler(new Error('boom'), mockReq(), res, jest.fn());
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'INTERNAL', message: expect.any(String) });
    expect(res.body).not.toHaveProperty('stack');
    expect(res.headers['Cache-Control']).toBe('no-store');
  });

  test('logs the unhandled error with route, params and stack', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = mockRes();
    const req = { method: 'GET', originalUrl: '/boom', query: { city: 'abc' }, params: {} };
    const err = new Error('boom');
    errorHandler(err, req, res, jest.fn());
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const logged = JSON.parse(errorSpy.mock.calls[0][0]);
    expect(logged.level).toBe('error');
    expect(logged.method).toBe('GET');
    expect(logged.path).toBe('/boom');
    expect(logged.query).toEqual({ city: 'abc' });
    expect(logged.params).toEqual({});
    expect(logged.stack).toBe(err.stack);
    errorSpy.mockRestore();
  });
});

describe('Request logger', () => {
  let logSpy;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    restoreEnv();
  });

  test('logs structured JSON with query context at debug level in development', async () => {
    process.env.NODE_ENV = 'development';
    await request(app).get('/health?city=abc&lat=1&lon=2');
    const last = logSpy.mock.calls[logSpy.mock.calls.length - 1][0];
    const entry = JSON.parse(last);
    expect(entry.level).toBe('debug');
    expect(entry.method).toBe('GET');
    expect(entry.path).toBe('/health?city=abc&lat=1&lon=2');
    expect(entry.status).toBe(200);
    expect(entry.durationMs).toBeGreaterThanOrEqual(0);
    expect(entry.city).toBe('abc');
    expect(entry.lat).toBe('1');
    expect(entry.lon).toBe('2');
  });

  test('logs at info level in production without query context', async () => {
    process.env.NODE_ENV = 'production';
    await request(app).get('/health');
    const last = logSpy.mock.calls[logSpy.mock.calls.length - 1][0];
    const entry = JSON.parse(last);
    expect(entry.level).toBe('info');
    expect(entry.method).toBe('GET');
    expect(entry.path).toBe('/health');
    expect(entry.status).toBe(200);
    expect(entry.city).toBeUndefined();
  });
});
