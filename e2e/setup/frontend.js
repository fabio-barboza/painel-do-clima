const { spawn } = require('node:child_process');
const path = require('node:path');

const HOST = '127.0.0.1';
const DEFAULT_FRONTEND_PORT = 5173;
const DEFAULT_BACKEND_PORT = 3100;
const FRONTEND_TITLE = 'Painel do Clima';
const PROBE_TIMEOUT_MS = 2000;
const READY_TIMEOUT_MS = 60000;
const READY_INTERVAL_MS = 250;
const KILL_GRACE_MS = 5000;

let child = null;
let stderrBuffer = '';

function getBackendPort() {
  return Number(process.env.E2E_BACKEND_PORT || DEFAULT_BACKEND_PORT);
}

function getFrontendPort() {
  return Number(process.env.E2E_FRONTEND_PORT || DEFAULT_FRONTEND_PORT);
}

async function isFrontendHealthy(port) {
  try {
    const response = await fetch(`http://${HOST}:${port}`, {
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS)
    });
    if (!response.ok) {
      return false;
    }
    const html = await response.text();
    return html.includes(FRONTEND_TITLE);
  } catch {
    return false;
  }
}

async function isFrontendCompatible(port) {
  try {
    const response = await fetch(`http://${HOST}:${port}/src/services/weatherApi.js`, {
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS)
    });
    if (!response.ok) {
      return false;
    }
    const source = await response.text();
    return source.includes(`http://${HOST}:${getBackendPort()}`);
  } catch {
    return false;
  }
}

function spawnVite() {
  const frontendDir = path.join(__dirname, '..', '..', 'frontend');
  const viteBin = path.join(frontendDir, 'node_modules', 'vite', 'bin', 'vite.js');
  const spawned = spawn(process.execPath, [viteBin, '--port', String(getFrontendPort()), '--strictPort'], {
    cwd: frontendDir,
    env: { ...process.env, VITE_API_URL: `http://${HOST}:${getBackendPort()}` },
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  spawned.stderr.on('data', (chunk) => {
    stderrBuffer += chunk.toString();
  });
  spawned.stdout.resume();
  return spawned;
}

function waitForReady() {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + READY_TIMEOUT_MS;
    const attempt = async () => {
      if (await isFrontendHealthy(getFrontendPort())) {
        resolve();
        return;
      }
      if (Date.now() >= deadline) {
        reject(new Error(`Frontend não ficou pronto em http://${HOST}:${getFrontendPort()}. ${stderrBuffer}`));
        return;
      }
      setTimeout(attempt, READY_INTERVAL_MS);
    };
    attempt();
  });
}

async function startFrontend() {
  const port = getFrontendPort();
  if (await isFrontendHealthy(port)) {
    if (process.env.RUN_REAL_E2E !== '1' && !(await isFrontendCompatible(port))) {
      throw new Error(
        `Frontend em http://${HOST}:${port} não aponta para o backend E2E (http://${HOST}:${getBackendPort()}). ` +
        'Encerre esse servidor ou defina E2E_FRONTEND_PORT para rodar a suite em outra porta.'
      );
    }
    return { port, reused: true };
  }
  stderrBuffer = '';
  child = spawnVite();
  const ready = waitForReady();
  const exitCode = await Promise.race([
    ready.then(() => null),
    new Promise((resolve) => child.once('exit', (code) => resolve(code)))
  ]);
  if (exitCode !== null) {
    child = null;
    throw new Error(`Vite terminou antes de ficar pronto (código ${exitCode}). ${stderrBuffer}`);
  }
  return { port: getFrontendPort(), reused: false };
}

function killProcessGroup(pid, signal) {
  try {
    process.kill(-pid, signal);
    return true;
  } catch {
    return false;
  }
}

async function stopFrontend() {
  if (!child) {
    return;
  }
  const target = child;
  child = null;
  if (target.exitCode !== null) {
    return;
  }
  const exited = new Promise((resolve) => target.once('exit', () => resolve()));
  killProcessGroup(target.pid, 'SIGTERM');
  const grace = new Promise((resolve) => setTimeout(resolve, KILL_GRACE_MS));
  await Promise.race([exited, grace]);
  if (target.exitCode === null) {
    killProcessGroup(target.pid, 'SIGKILL');
    await exited;
  }
}

module.exports = { startFrontend, stopFrontend };
