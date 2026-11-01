require('dotenv').config();
const express = require('express');

const app = express();
const { PORT } = require('./config');
const cacheNoStore = require('./middleware/cache');
const cors = require('./middleware/cors');
const { logger, logError } = require('./middleware/logger');
const ExternalError = require('./services/externalError');
const weatherRouter = require('./routes/weather');

app.set('etag', false);

app.use(cacheNoStore);
app.use(cors);
app.use(logger);
app.use(express.json());

app.use('/api/weather', weatherRouter);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Service is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

app.use((err, req, res, next) => {
  logError(err, req, res);
  const status = err instanceof ExternalError ? (err.status || 502) : 500;
  res.status(status).json({ error: err.message || 'Erro interno do servidor' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
  });
}

module.exports = app;
