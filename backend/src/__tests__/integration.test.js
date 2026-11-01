process.env.NODE_ENV = 'development';
process.env.CORS_ORIGINS = '*';

const request = require('supertest');
const express = require('express');
const app = require('../../src/index');
const cacheNoStore = require('../../src/middleware/cache');
const ExternalError = require('../../src/services/externalError');

describe('Integration (Supertest contra o app real)', () => {
  describe('GET /health', () => {
    test('retorna 200 com Cache-Control: no-store e sem ETag', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'OK');
      expect(res.headers['cache-control']).toBe('no-store');
      expect(res.headers['etag']).toBeUndefined();
    });
  });

  describe('OPTIONS preflight', () => {
    test('OPTIONS /api/qualquer -> 204 com allow-* e eco da origem', async () => {
      const res = await request(app).options('/api/qualquer').set('Origin', 'http://example.com');
      expect(res.status).toBe(204);
      expect(res.headers['access-control-allow-origin']).toBe('http://example.com');
      expect(res.headers['access-control-allow-methods']).toBe('GET, OPTIONS');
      expect(res.headers['access-control-allow-headers']).toBe('Content-Type, Authorization');
    });
  });

  describe('Rota desconhecida', () => {
    test('retorna 404 em JSON { error }', async () => {
      const res = await request(app).get('/rota-desconhecida');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
      expect(res.headers['cache-control']).toBe('no-store');
    });
  });

  describe('Manuseio de erros (handler real de index.js)', () => {
    test('erro inesperado -> 500 em JSON { error } (via corpo JSON inválido)', async () => {
      const res = await request(app)
        .post('/health')
        .type('json')
        .send('{corpo invalido')
        .expect(500);
      expect(res.body).toHaveProperty('error');
      expect(res.headers['cache-control']).toBe('no-store');
      expect(res.headers['etag']).toBeUndefined();
    });
  });

  describe('Contrato ExternalError -> 502', () => {
    test('ExternalError -> 502 em JSON { error }', async () => {
      const mini = express();
      mini.use(cacheNoStore);
      mini.get('/boom', (req, res, next) => next(new ExternalError('Falha da API externa', 502)));
      mini.use((err, req, res, next) => {
        const status = err instanceof ExternalError ? (err.status || 502) : 500;
        res.status(status).json({ error: err.message || 'Erro interno do servidor' });
      });
      const res = await request(mini).get('/boom');
      expect(res.status).toBe(502);
      expect(res.body).toHaveProperty('error');
      expect(res.headers['cache-control']).toBe('no-store');
    });
  });
});
