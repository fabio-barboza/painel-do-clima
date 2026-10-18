const http = require('node:http');
const { geocodingSaoPaulo, geocodingEmpty, forecast } = require('./fixtures');

const DEFAULT_MOCK_PORT = 9100;
const GEOCODING_PATH = '/v1/search';
const FORECAST_PATH = '/v1/forecast';
const CONTROL_PATH = '/__control/forecast';

let server = null;
let forecastFailStatus = null;

function normalizeName(name) {
  return String(name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function isSaoPaulo(name) {
  return normalizeName(name).includes('sao paulo');
}

function sendJson(res, statusCode, payload) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.writeHead(statusCode);
  res.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on('data', (chunk) => chunks.push(chunk));
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    request.on('error', reject);
  });
}

function handleControl(request, response) {
  readBody(request)
    .then((raw) => {
      let failStatus = null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Number.isInteger(parsed.status) && parsed.status >= 400) {
          failStatus = parsed.status;
        }
      }
      forecastFailStatus = failStatus;
      sendJson(response, 200, { ok: true, forecastFailStatus });
    })
    .catch(() => sendJson(response, 400, { error: 'BAD_REQUEST', message: 'Corpo inválido.' }));
}

function handleRequest(req, res) {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === CONTROL_PATH && req.method === 'POST') {
    handleControl(req, res);
    return;
  }
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'METHOD_NOT_ALLOWED' });
    return;
  }
  if (url.pathname === GEOCODING_PATH) {
    const name = url.searchParams.get('name');
    sendJson(res, 200, isSaoPaulo(name) ? geocodingSaoPaulo : geocodingEmpty);
    return;
  }
  if (url.pathname === FORECAST_PATH) {
    if (forecastFailStatus !== null) {
      sendJson(res, forecastFailStatus, { error: 'INTERNAL', message: 'Simulated forecast failure.' });
      return;
    }
    sendJson(res, 200, forecast);
    return;
  }
  sendJson(res, 404, { error: 'NOT_FOUND' });
}

function listen(serverInstance, port) {
  return new Promise((resolve, reject) => {
    const onError = () => {
      reject(new Error(`Porta ${port} do mock server em uso. Encerre o processo que a ocupa e rode novamente.`));
    };
    serverInstance.once('error', onError);
    serverInstance.listen(port, '127.0.0.1', () => {
      serverInstance.removeListener('error', onError);
      resolve();
    });
  });
}

async function startMockServer() {
  if (server) {
    return { port: server.address().port, started: false };
  }
  const port = Number(process.env.E2E_MOCK_PORT || DEFAULT_MOCK_PORT);
  server = http.createServer(handleRequest);
  await listen(server, port);
  return { port, started: true };
}

async function stopMockServer() {
  if (!server) {
    return;
  }
  const closingServer = server;
  server = null;
  closingServer.closeAllConnections();
  await new Promise((resolve) => closingServer.close(resolve));
}

module.exports = { startMockServer, stopMockServer };
