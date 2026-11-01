process.env.NODE_ENV = 'development';
process.env.CORS_ORIGINS = '*';

const request = require('supertest');
const express = require('express');

describe('middleware/cache.js', () => {
  const cacheNoStore = require('../middleware/cache');

  test('define Cache-Control: no-store em toda resposta', async () => {
    const app = express();
    app.use(cacheNoStore);
    app.get('/', (req, res) => res.json({ ok: true }));

    const res = await request(app).get('/');
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.status).toBe(200);
  });
});

describe('middleware/cors.js', () => {
  afterEach(() => {
    jest.resetModules();
  });

  function invokeCors(req) {
    const cors = require('../middleware/cors');
    const headers = {};
    let statusCode = null;
    let nextCalled = false;
    let nextErr;
    const res = {
      setHeader: (key, value) => { headers[key.toLowerCase()] = value; },
      status: (code) => { statusCode = code; return res; },
      end: () => {}
    };
    cors(req, res, (err) => { nextCalled = true; nextErr = err; });
    return { headers, statusCode, nextCalled, nextErr };
  }

  test('preflight OPTIONS -> 204 com allow-* e eco da origem (dev: qualquer origem)', () => {
    const cors = require('../middleware/cors');
    const result = invokeCors({ method: 'OPTIONS', headers: { origin: 'http://example.com' } });

    expect(result.statusCode).toBe(204);
    expect(result.headers['access-control-allow-origin']).toBe('http://example.com');
    expect(result.headers['access-control-allow-methods']).toBe('GET, OPTIONS');
    expect(result.headers['access-control-allow-headers']).toBe('Content-Type, Authorization');
  });

  test('eco a origem permitida em produção (CORS_ORIGINS explícito)', () => {
    jest.doMock('../config', () => ({
      corsOrigins: ['http://allowed.com'],
      corsAllowedAnyOrigin: false,
      isDev: false
    }));
    const cors = require('../middleware/cors');
    const result = invokeCors({ method: 'GET', headers: { origin: 'http://allowed.com' } });

    expect(result.headers['access-control-allow-origin']).toBe('http://allowed.com');
  });

  test('origem não permitida em produção não recebe Access-Control-Allow-Origin', () => {
    jest.doMock('../config', () => ({
      corsOrigins: ['http://allowed.com'],
      corsAllowedAnyOrigin: false,
      isDev: false
    }));
    const cors = require('../middleware/cors');
    const result = invokeCors({ method: 'GET', headers: { origin: 'http://evil.com' } });

    expect(result.headers['access-control-allow-origin']).toBeUndefined();
  });
});

describe('middleware/logger.js', () => {
  const logger = require('../middleware/logger').logger;

  test('escreve método, rota, status e duração via console, sem dados pessoais', () => {
    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    let nextCalled = false;
    const req = { method: 'GET', path: '/api/weather' };
    const res = { statusCode: 200, on: (event, cb) => { if (event === 'finish') cb(); } };

    logger(req, res, () => { nextCalled = true; });

    expect(nextCalled).toBe(true);
    expect(infoSpy).toHaveBeenCalledTimes(1);
    const logged = infoSpy.mock.calls[0][0];
    expect(logged).toContain('GET');
    expect(logged).toContain('/api/weather');
    expect(logged).toContain('200');
    expect(logged).toMatch(/\d+ms/);
    expect(logged).not.toContain('user-agent');
    expect(logged).not.toContain('192.168.');

    infoSpy.mockRestore();
  });

  test('não grava coordenadas da query de geolocalização', () => {
    const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    const req = { method: 'GET', path: '/api/weather', originalUrl: '/api/weather?latitude=-25.43&longitude=-49.27' };
    const res = { statusCode: 200, on: (event, cb) => { if (event === 'finish') cb(); } };

    logger(req, res, () => {});

    const logged = infoSpy.mock.calls[0][0];
    expect(logged).toContain('/api/weather');
    expect(logged).not.toContain('-25.43');
    expect(logged).not.toContain('-49.27');
    expect(logged).not.toContain('latitude');
    expect(logged).not.toContain('longitude');

    infoSpy.mockRestore();
  });

  test('logError registra detalhes do erro sem expor pilha ou dados pessoais', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { logError } = require('../middleware/logger');
    const err = new Error('Timeout na API externa');
    const res = { statusCode: 502 };

    logError(err, { method: 'GET', path: '/api/weather' }, res);

    expect(errorSpy).toHaveBeenCalledTimes(1);
    const logged = JSON.parse(errorSpy.mock.calls[0][0]);
    expect(logged.error).toBe('Timeout na API externa');
    expect(logged.status).toBe(502);
    expect(logged.stack).toBeUndefined();

    errorSpy.mockRestore();
  });
});

describe('services/externalError.js', () => {
  const ExternalError = require('../services/externalError');

  test('é instância de Error', () => {
    expect(new ExternalError('boom')).toBeInstanceOf(Error);
    expect(new ExternalError('boom')).toBeInstanceOf(ExternalError);
  });

  test('status é opcional (undefined por padrão)', () => {
    const err = new ExternalError('timeout');
    expect(err.status).toBeUndefined();
  });

  test('aceita status explícito', () => {
    const err = new ExternalError('falha', 502);
    expect(err.status).toBe(502);
    expect(err.message).toBe('falha');
  });
});
