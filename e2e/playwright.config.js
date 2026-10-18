const { defineConfig, devices } = require('@playwright/test');

const RUN_REAL_E2E = process.env.RUN_REAL_E2E === '1';
const E2E_FRONTEND_PORT = process.env.E2E_FRONTEND_PORT;
const BASE_URL = E2E_FRONTEND_PORT ? `http://localhost:${E2E_FRONTEND_PORT}` : 'http://localhost:5173';

module.exports = defineConfig({
  testDir: './tests',
  globalSetup: './global-setup.js',
  globalTeardown: './global-teardown.js',
  outputDir: './test-results',
  workers: 1,
  fullyParallel: false,
  retries: 0,
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  testIgnore: RUN_REAL_E2E
    ? [
        '**/search-success.spec.js',
        '**/search-not-found.spec.js',
        '**/geo-granted.spec.js',
        '**/geo-denied.spec.js',
        '**/retry-500.spec.js'
      ]
    : [],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
