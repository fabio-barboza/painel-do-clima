const express = require('express');
const noStore = require('./middleware/noStore');
const { createCors, parseCorsOrigins } = require('./middleware/cors');
const errorHandler = require('./middleware/errorHandler');
const HttpError = require('./lib/httpError');
const healthRouter = require('./routes/health');
const weatherRouter = require('./routes/weather');

const NOT_FOUND_STATUS = 404;
const NOT_FOUND_CODE = 'NOT_FOUND';
const NOT_FOUND_MESSAGE = 'Rota não encontrada.';
const PRODUCTION_ENVIRONMENT = 'production';

const app = express();

app.disable('etag');
app.use(noStore);
app.use(
  createCors({
    origins: parseCorsOrigins(process.env.CORS_ORIGINS),
    isProduction: process.env.NODE_ENV === PRODUCTION_ENVIRONMENT
  })
);
app.use(express.json());
app.use(healthRouter);
app.use(weatherRouter);
app.use((req, res, next) => {
  next(new HttpError(NOT_FOUND_STATUS, NOT_FOUND_CODE, NOT_FOUND_MESSAGE));
});
app.use(errorHandler);

module.exports = app;
