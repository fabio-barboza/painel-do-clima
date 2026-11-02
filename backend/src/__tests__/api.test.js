const request = require('supertest');
const app = require('../app');

const NO_STORE = 'no-store';
const PREFLIGHT_STATUS = 204;

describe('API Endpoints', () => {
  describe('GET /health', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });

    test('should send no-store and no ETag', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.headers['cache-control']).toBe(NO_STORE);
      expect(response.headers.etag).toBeUndefined();
    });
  });

  describe('Unknown routes', () => {
    test('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404);

      expect(response.body).toBeDefined();
    });

    test('should return the error body with no-store and no ETag', async () => {
      const response = await request(app).get('/unknown-route').expect(404);

      expect(response.body).toEqual({
        error: { code: 'NOT_FOUND', message: 'Rota não encontrada.' }
      });
      expect(response.headers['cache-control']).toBe(NO_STORE);
      expect(response.headers.etag).toBeUndefined();
    });
  });

  describe('CORS preflight', () => {
    test('should answer OPTIONS with 204 and the allowed methods and headers', async () => {
      const response = await request(app)
        .options('/health')
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'GET')
        .expect(PREFLIGHT_STATUS);

      expect(response.headers['access-control-allow-methods']).toBe('GET, OPTIONS');
      expect(response.headers['access-control-allow-headers']).toBe('Content-Type');
      expect(response.headers['cache-control']).toBe(NO_STORE);
      expect(response.headers.etag).toBeUndefined();
    });
  });
});
