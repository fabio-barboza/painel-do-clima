const { startMockServer, stopMockServer } = require('./setup/mockServer');
const { startBackend, stopBackend } = require('./setup/backend');
const { startFrontend, stopFrontend } = require('./setup/frontend');

async function cleanup() {
  await stopFrontend();
  await stopBackend();
  await stopMockServer();
}

module.exports = async function globalSetup() {
  const runReal = process.env.RUN_REAL_E2E === '1';
  try {
    let mock = { port: null };
    if (!runReal) {
      mock = await startMockServer();
      process.env.E2E_MOCK_URL = `http://127.0.0.1:${mock.port}`;
    }
    const backend = await startBackend();
    const frontend = await startFrontend();
    const reusedNote = frontend.reused ? ' (servidor existente reutilizado)' : '';
    console.log(`[e2e] modo: ${runReal ? 'APIs reais (RUN_REAL_E2E=1)' : 'mocks determinísticos'}`);
    if (!runReal) {
      console.log(`[e2e] mock server em http://127.0.0.1:${mock.port}`);
    }
    console.log(`[e2e] backend em http://127.0.0.1:${backend.port}${runReal ? '' : ' apontando para o mock'}`);
    console.log(`[e2e] frontend em http://localhost:${frontend.port}${reusedNote}`);
  } catch (error) {
    await cleanup();
    throw error;
  }
};
