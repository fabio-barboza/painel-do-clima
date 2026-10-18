const { getEnv } = require('../config/env');

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

describe('getEnv', () => {
  afterEach(restoreEnv);

  test('returns production defaults when variables are unset', () => {
    delete process.env.PORT;
    delete process.env.NODE_ENV;
    delete process.env.CORS_ORIGINS;
    delete process.env.GEOCODING_BASE_URL;
    delete process.env.FORECAST_BASE_URL;
    delete process.env.EXTERNAL_TIMEOUT_MS;

    const env = getEnv();

    expect(env.port).toBe(3000);
    expect(env.nodeEnv).toBe('development');
    expect(env.corsOrigins).toEqual([]);
    expect(env.geocodingBaseUrl).toBe('https://geocoding-api.open-meteo.com');
    expect(env.forecastBaseUrl).toBe('https://api.open-meteo.com');
    expect(env.externalTimeoutMs).toBe(10000);
  });

  test('applies overrides from environment variables', () => {
    process.env.PORT = '4000';
    process.env.NODE_ENV = 'production';
    process.env.CORS_ORIGINS = 'https://a.com, https://b.com';
    process.env.GEOCODING_BASE_URL = 'http://localhost:9001';
    process.env.FORECAST_BASE_URL = 'http://localhost:9002';
    process.env.EXTERNAL_TIMEOUT_MS = '2500';

    const env = getEnv();

    expect(env.port).toBe(4000);
    expect(env.nodeEnv).toBe('production');
    expect(env.corsOrigins).toEqual(['https://a.com', 'https://b.com']);
    expect(env.geocodingBaseUrl).toBe('http://localhost:9001');
    expect(env.forecastBaseUrl).toBe('http://localhost:9002');
    expect(env.externalTimeoutMs).toBe(2500);
  });

  test('trims and drops empty entries when parsing CORS_ORIGINS', () => {
    process.env.CORS_ORIGINS = ' , https://a.com , , ';
    expect(getEnv().corsOrigins).toEqual(['https://a.com']);
  });

  test('falls back to defaults for non-numeric PORT and timeout', () => {
    process.env.PORT = 'not-a-number';
    process.env.EXTERNAL_TIMEOUT_MS = 'abc';

    const env = getEnv();

    expect(env.port).toBe(3000);
    expect(env.externalTimeoutMs).toBe(10000);
  });
});
