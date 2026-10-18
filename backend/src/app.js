const express = require('express');
const { getEnv } = require('./config/env');
const noCache = require('./middleware/noCache');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const weatherRouter = require('./routes/weather');

function createRequestLogger() {
  return (req, res, next) => {
    const startedAt = Date.now();
    res.on('finish', () => {
      const { nodeEnv } = getEnv();
      const entry = {
        level: nodeEnv === 'production' ? 'info' : 'debug',
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs: Date.now() - startedAt
      };
      if (req.query.city) {
        entry.city = req.query.city;
      }
      if (req.query.lat) {
        entry.lat = req.query.lat;
      }
      if (req.query.lon) {
        entry.lon = req.query.lon;
      }
      console.log(JSON.stringify(entry));
    });
    next();
  };
}

function createCorsMiddleware() {
  return (req, res, next) => {
    const { nodeEnv, corsOrigins } = getEnv();
    if (nodeEnv === 'development') {
      res.setHeader('Access-Control-Allow-Origin', '*');
    } else {
      const origin = req.headers.origin;
      if (origin && corsOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
      } else if (!origin) {
        res.setHeader('Access-Control-Allow-Origin', '*');
      }
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    next();
  };
}

function createApp() {
  const app = express();
  app.disable('etag');
  app.use(express.json());
  app.use(noCache);
  app.use(createCorsMiddleware());
  app.use(createRequestLogger());
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      message: 'Service is healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });
  app.use('/api/weather', weatherRouter);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = createApp;
