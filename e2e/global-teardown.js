const { stopMockServer } = require('./setup/mockServer');
const { stopBackend } = require('./setup/backend');
const { stopFrontend } = require('./setup/frontend');

module.exports = async function globalTeardown() {
  await stopFrontend();
  await stopBackend();
  await stopMockServer();
};
