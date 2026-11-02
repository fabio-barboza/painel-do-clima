const HttpError = require('./httpError');

const BAD_REQUEST_STATUS = 400;
const INVALID_PARAMS_CODE = 'INVALID_PARAMS';
const MAX_CITY_LENGTH = 100;
const LATITUDE_LIMIT = 90;
const LONGITUDE_LIMIT = 180;
const DECIMAL_PATTERN = /^-?\d+(\.\d+)?$/;
const MESSAGE_MISSING_PARAMS = 'Informe city ou os dois parâmetros lat e lon.';
const MESSAGE_CITY_INVALID = 'O parâmetro city deve ter entre 1 e 100 caracteres.';
const MESSAGE_CITY_WITH_COORDINATES = 'Use city ou lat e lon, não os dois.';
const MESSAGE_COORDINATE_INVALID = 'Coordenadas devem ser números decimais dentro dos limites.';
const MESSAGE_PARAM_REPEATED = 'Parâmetro repetido ou em formato inválido.';

function createInvalidParamsError(message) {
  return new HttpError(BAD_REQUEST_STATUS, INVALID_PARAMS_CODE, message);
}

function readSingleParam(query, name) {
  const value = query[name];
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw createInvalidParamsError(MESSAGE_PARAM_REPEATED);
  }
  return value;
}

function parseCity(rawCity) {
  const city = rawCity.trim();
  if (city.length === 0 || city.length > MAX_CITY_LENGTH) {
    throw createInvalidParamsError(MESSAGE_CITY_INVALID);
  }
  return city;
}

function parseCoordinate(rawValue, limit) {
  const value = Number(rawValue);
  if (!DECIMAL_PATTERN.test(rawValue) || Math.abs(value) > limit) {
    throw createInvalidParamsError(MESSAGE_COORDINATE_INVALID);
  }
  return value;
}

function parseWeatherQuery(query) {
  const city = readSingleParam(query, 'city');
  const latitude = readSingleParam(query, 'lat');
  const longitude = readSingleParam(query, 'lon');
  const hasCoordinates = latitude !== undefined || longitude !== undefined;

  if (city !== undefined && hasCoordinates) {
    throw createInvalidParamsError(MESSAGE_CITY_WITH_COORDINATES);
  }
  if (city !== undefined) {
    return { type: 'city', city: parseCity(city) };
  }
  if (latitude === undefined || longitude === undefined) {
    throw createInvalidParamsError(MESSAGE_MISSING_PARAMS);
  }
  return {
    type: 'coords',
    latitude: parseCoordinate(latitude, LATITUDE_LIMIT),
    longitude: parseCoordinate(longitude, LONGITUDE_LIMIT)
  };
}

module.exports = parseWeatherQuery;
