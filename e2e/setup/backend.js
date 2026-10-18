const HOST = '127.0.0.1';
const DEFAULT_BACKEND_PORT = 3100;
const DEFAULT_MOCK_PORT = 9100;
const HEALTH_PATH = '/health';
const HEALTH_TIMEOUT_MS = 10000;
const HEALTH_INTERVAL_MS = 100;

let server = null;

function getBackendPort() {
  return Number(process.env.E2E_BACKEND_PORT || DEFAULT_BACKEND_PORT);
}

function getMockPort() {
  return Number(process.env.E2E_MOCK_PORT || DEFAULT_MOCK_PORT);
}

function applyMockEnv() {
  process.env.PORT = String(getBackendPort());
  process.env.NODE_ENV = 'development';
  if (process.env.RUN_REAL_E2E !== '1') {
    process.env.GEOCODING_BASE_URL = `http://${HOST}:${getMockPort()}`;
    process.env.FORECAST_BASE_URL = `http://${HOST}:${getMockPort()}`;
  }
}

function waitForHealth(port) {
  const healthUrl = `http://${HOST}:${port}${HEALTH_PATH}`;
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + HEALTH_TIMEOUT_MS;
    const attempt = async () => {
      let healthy = false;
      try {
        const response = await fetch(healthUrl);
        healthy = response.ok;
      } catch {
        healthy = false;
      }
      if (healthy) {
        resolve();
        return;
      }
      if (Date.now() >= deadline) {
        reject(new Error(`Backend E2E não respondeu em ${healthUrl}`));
        return;
      }
      setTimeout(attempt, HEALTH_INTERVAL_MS);
    };
    attempt();
  });
}

async function startBackend() {
  if (server) {
    return { port: server.address().port, started: false };
  }
  const port = getBackendPort();
  applyMockEnv();
  const createApp = require('../../backend/src/app');
  server = createApp().listen(port, HOST);
  await new Promise((resolve, reject) => {
    const onError = () => {
      reject(new Error(`Porta ${port} do backend E2E em uso. Encerre o processo que a ocupa e rode novamente.`));
    };
    server.once('error', onError);
    server.once('listening', () => {
      server.removeListener('error', onError);
      resolve();
    });
  });
  await waitForHealth(port);
  return { port, started: true };
}

async function stopBackend() {
  if (!server) {
    return;
  }
  const closingServer = server;
  server = null;
  closingServer.closeAllConnections();
  await new Promise((resolve) => closingServer.close(resolve));
}

module.exports = { startBackend, stopBackend };
