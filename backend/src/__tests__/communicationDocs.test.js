const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const request = require('supertest');

const ROOT_DIR = path.resolve(__dirname, '../../..');
const BACKEND_ENV_EXAMPLE_PATH = path.join(ROOT_DIR, 'backend/.env.example');
const README_PATH = path.join(ROOT_DIR, 'README.md');

const PRODUCTION_ORIGIN = 'http://localhost:4173';
const DEVELOPMENT_ORIGIN = 'http://localhost:5173';
const BLOCKED_ORIGIN = 'http://evil.example.com';
const CORS_HEADER_ORIGIN = 'access-control-allow-origin';
const CORS_HEADER_METHODS = 'access-control-allow-methods';
const CORS_HEADER_HEADERS = 'access-control-allow-headers';
const ALLOWED_METHODS = 'GET, OPTIONS';
const ALLOWED_HEADERS = 'Content-Type';
const PREFLIGHT_STATUS = 204;

const readText = (filePath) => fs.readFileSync(filePath, 'utf8');

describe('backend/.env.example', () => {
  test('should document PORT, NODE_ENV and CORS_ORIGINS with their defaults', () => {
    const parsed = dotenv.parse(readText(BACKEND_ENV_EXAMPLE_PATH));

    expect(parsed).toEqual({
      PORT: '3000',
      NODE_ENV: 'development',
      CORS_ORIGINS: ''
    });
  });
});

describe('README.md communication and ports', () => {
  const readme = readText(README_PATH);

  test('should document the development and production ports of both services', () => {
    expect(readme).toContain('| Desenvolvimento | `npm run dev`, porta 5173 | `npm run dev`, porta 3000 |');
    expect(readme).toContain('| Produção | `npm run build` + `npm run preview`, porta 4173 | `npm start`, porta 3000 |');
  });

  test('should document CORS_ORIGINS, NODE_ENV and the wildcard in development', () => {
    expect(readme).toContain('| `backend/.env` | `CORS_ORIGINS` | vazio |');
    expect(readme).toContain('| `backend/.env` | `NODE_ENV` | `development` |');
    expect(readme).toContain('Access-Control-Allow-Origin: *');
  });

  test('should state that the frontend never calls Open-Meteo and that the geolocation needs a secure context', () => {
    expect(readme).toContain('O frontend nunca chama a Open-Meteo');
    expect(readme).toContain('contexto seguro');
  });
});

describe('CORS contract documented for production (Supertest)', () => {
  let app;
  const originalEnv = { NODE_ENV: process.env.NODE_ENV, CORS_ORIGINS: process.env.CORS_ORIGINS };

  beforeAll(() => {
    process.env.NODE_ENV = 'production';
    process.env.CORS_ORIGINS = PRODUCTION_ORIGIN;
    jest.resetModules();
    app = require('../app');
  });

  afterAll(() => {
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
    jest.resetModules();
  });

  test('should release the listed origin with Vary, no-store and no ETag', async () => {
    const response = await request(app).get('/health').set('Origin', PRODUCTION_ORIGIN);

    expect(response.status).toBe(200);
    expect(response.headers[CORS_HEADER_ORIGIN]).toBe(PRODUCTION_ORIGIN);
    expect(response.headers.vary).toBe('Origin');
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.headers.etag).toBeUndefined();
  });

  test('should not release an origin missing from CORS_ORIGINS', async () => {
    const response = await request(app).get('/health').set('Origin', DEVELOPMENT_ORIGIN);

    expect(response.status).toBe(200);
    expect(response.headers[CORS_HEADER_ORIGIN]).toBeUndefined();
  });

  test('should not release a blocked origin', async () => {
    const response = await request(app).get('/health').set('Origin', BLOCKED_ORIGIN);

    expect(response.status).toBe(200);
    expect(response.headers[CORS_HEADER_ORIGIN]).toBeUndefined();
  });

  test('should answer the preflight of the listed origin with the full contract', async () => {
    const response = await request(app)
      .options('/api/weather')
      .set('Origin', PRODUCTION_ORIGIN)
      .set('Access-Control-Request-Method', 'GET');

    expect(response.status).toBe(PREFLIGHT_STATUS);
    expect(response.headers[CORS_HEADER_ORIGIN]).toBe(PRODUCTION_ORIGIN);
    expect(response.headers[CORS_HEADER_METHODS]).toBe(ALLOWED_METHODS);
    expect(response.headers[CORS_HEADER_HEADERS]).toBe(ALLOWED_HEADERS);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.text).toBe('');
  });

  test('should answer the preflight of a blocked origin without CORS headers', async () => {
    const response = await request(app)
      .options('/api/weather')
      .set('Origin', BLOCKED_ORIGIN)
      .set('Access-Control-Request-Method', 'GET');

    expect(response.status).toBe(PREFLIGHT_STATUS);
    expect(response.headers[CORS_HEADER_ORIGIN]).toBeUndefined();
    expect(response.headers[CORS_HEADER_METHODS]).toBeUndefined();
  });
});
