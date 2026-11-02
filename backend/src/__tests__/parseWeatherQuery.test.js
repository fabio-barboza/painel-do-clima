const parseWeatherQuery = require('../lib/parseWeatherQuery');
const HttpError = require('../lib/httpError');

const INVALID_PARAMS_CODE = 'INVALID_PARAMS';
const BAD_REQUEST_STATUS = 400;
const LONG_CITY_LENGTH = 101;
const MAX_CITY_LENGTH = 100;

function expectInvalidParams(query) {
  let caught;
  try {
    parseWeatherQuery(query);
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(HttpError);
  expect(caught.status).toBe(BAD_REQUEST_STATUS);
  expect(caught.code).toBe(INVALID_PARAMS_CODE);
}

describe('parseWeatherQuery', () => {
  describe('city queries', () => {
    test('should return a city query with the trimmed name', () => {
      expect(parseWeatherQuery({ city: '  Curitiba  ' })).toEqual({ type: 'city', city: 'Curitiba' });
    });

    test('should accept a single character city name', () => {
      expect(parseWeatherQuery({ city: 'A' })).toEqual({ type: 'city', city: 'A' });
    });

    test('should accept a city name with exactly the maximum length', () => {
      const city = 'a'.repeat(MAX_CITY_LENGTH);
      expect(parseWeatherQuery({ city })).toEqual({ type: 'city', city });
    });

    test('should reject a city name longer than the maximum length', () => {
      expectInvalidParams({ city: 'a'.repeat(LONG_CITY_LENGTH) });
    });

    test('should reject an empty city', () => {
      expectInvalidParams({ city: '' });
    });

    test('should reject a city made only of spaces', () => {
      expectInvalidParams({ city: '   ' });
    });

    test('should reject a repeated city parameter', () => {
      expectInvalidParams({ city: ['Curitiba', 'Londrina'] });
    });

    test('should reject a city parameter sent as an object', () => {
      expectInvalidParams({ city: { name: 'Curitiba' } });
    });

    test('should reject a city combined with coordinates', () => {
      expectInvalidParams({ city: 'Curitiba', lat: '-25.41', lon: '-49.24' });
    });

    test('should reject a city combined with only latitude', () => {
      expectInvalidParams({ city: 'Curitiba', lat: '-25.41' });
    });
  });

  describe('coordinate queries', () => {
    test('should return a coords query with numeric values', () => {
      expect(parseWeatherQuery({ lat: '-25.41', lon: '-49.24' })).toEqual({
        type: 'coords',
        latitude: -25.41,
        longitude: -49.24
      });
    });

    test('should accept the coordinate limits', () => {
      expect(parseWeatherQuery({ lat: '90', lon: '-180' })).toEqual({
        type: 'coords',
        latitude: 90,
        longitude: -180
      });
      expect(parseWeatherQuery({ lat: '-90', lon: '180' })).toEqual({
        type: 'coords',
        latitude: -90,
        longitude: 180
      });
    });

    test('should accept zero coordinates', () => {
      expect(parseWeatherQuery({ lat: '0', lon: '0' })).toEqual({
        type: 'coords',
        latitude: 0,
        longitude: 0
      });
    });

    test('should reject a latitude above 90', () => {
      expectInvalidParams({ lat: '90.001', lon: '0' });
    });

    test('should reject a latitude below -90', () => {
      expectInvalidParams({ lat: '-91', lon: '0' });
    });

    test('should reject a longitude above 180', () => {
      expectInvalidParams({ lat: '0', lon: '180.5' });
    });

    test('should reject a longitude below -180', () => {
      expectInvalidParams({ lat: '0', lon: '-181' });
    });

    test('should reject a non decimal latitude', () => {
      expectInvalidParams({ lat: 'abc', lon: '0' });
    });

    test('should reject a latitude with exponent notation', () => {
      expectInvalidParams({ lat: '1e2', lon: '0' });
    });

    test('should reject a longitude with a leading plus sign', () => {
      expectInvalidParams({ lat: '0', lon: '+10' });
    });

    test('should reject a longitude with a trailing dot', () => {
      expectInvalidParams({ lat: '0', lon: '10.' });
    });

    test('should reject a repeated latitude', () => {
      expectInvalidParams({ lat: ['1', '2'], lon: '0' });
    });

    test('should reject only latitude', () => {
      expectInvalidParams({ lat: '-25.41' });
    });

    test('should reject only longitude', () => {
      expectInvalidParams({ lon: '-49.24' });
    });
  });

  describe('missing parameters', () => {
    test('should reject a query without parameters', () => {
      expectInvalidParams({});
    });

    test('should reject a query with unrelated parameters only', () => {
      expectInvalidParams({ unrelated: 'value' });
    });
  });
});
