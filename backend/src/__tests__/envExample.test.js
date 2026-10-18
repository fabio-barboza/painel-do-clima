const fs = require('fs');
const path = require('path');
const { getEnv } = require('../config/env');

const ENV_EXAMPLE_PATH = path.join(__dirname, '..', '..', '.env.example');

const EXPECTED_VARS = [
  'PORT',
  'NODE_ENV',
  'CORS_ORIGINS',
  'GEOCODING_BASE_URL',
  'FORECAST_BASE_URL',
  'EXTERNAL_TIMEOUT_MS'
];

const ORIGINAL_ENV = { ...process.env };

function restoreEnv() {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) {
      delete process.env[key];
    }
  }
  for (const key of Object.keys(ORIGINAL_ENV)) {
    process.env[key] = ORIGINAL_ENV[key];
  }
}

function readContent() {
  return fs.readFileSync(ENV_EXAMPLE_PATH, 'utf8');
}

function parseEntries(content) {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
    .map((line) => {
      const index = line.indexOf('=');
      return { key: line.slice(0, index).trim(), value: line.slice(index + 1).trim() };
    });
}

describe('backend/.env.example (consistência docs ↔ código)', () => {
  afterEach(restoreEnv);

  test('contém exatamente as variáveis lidas pelo getEnv()', () => {
    const keys = parseEntries(readContent()).map((entry) => entry.key);
    expect([...keys].sort()).toEqual([...EXPECTED_VARS].sort());
  });

  test('não contém variáveis duplicadas', () => {
    const keys = parseEntries(readContent()).map((entry) => entry.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  test('cada variável tem formato KEY=VALUE com valor não vazio', () => {
    for (const entry of parseEntries(readContent())) {
      expect(entry.key).toMatch(/^[A-Z][A-Z0-9_]*$/);
      expect(entry.value.length).toBeGreaterThan(0);
    }
  });

  test('não contém comentários (restrição do PRD)', () => {
    const content = readContent();
    expect(content).not.toMatch(/^\s*#/m);
    expect(content).not.toMatch(/=\s*#/);
  });

  test('os valores de exemplo correspondem aos defaults do config/env.js', () => {
    delete process.env.PORT;
    delete process.env.NODE_ENV;
    delete process.env.CORS_ORIGINS;
    delete process.env.GEOCODING_BASE_URL;
    delete process.env.FORECAST_BASE_URL;
    delete process.env.EXTERNAL_TIMEOUT_MS;

    const defaults = getEnv();
    const values = Object.fromEntries(parseEntries(readContent()).map((entry) => [entry.key, entry.value]));

    expect(values.PORT).toBe(String(defaults.port));
    expect(values.GEOCODING_BASE_URL).toBe(defaults.geocodingBaseUrl);
    expect(values.FORECAST_BASE_URL).toBe(defaults.forecastBaseUrl);
    expect(values.EXTERNAL_TIMEOUT_MS).toBe(String(defaults.externalTimeoutMs));
  });
});
