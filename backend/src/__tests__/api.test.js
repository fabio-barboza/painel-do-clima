const request = require('supertest');
const createApp = require('../app');

describe('API Endpoints', () => {
  const app = createApp();

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
  });

  describe('Unknown routes', () => {
    test('should return 404 JSON for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('error', 'NOT_FOUND');
      expect(response.body).toHaveProperty('message');
    });
  });
});
