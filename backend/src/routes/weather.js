const express = require('express');
const parseWeatherQuery = require('../lib/parseWeatherQuery');
const HttpError = require('../lib/httpError');
const { geocodeCity, fetchForecast } = require('../services/openMeteo');

const WEATHER_STATUS_OK = 200;
const NOT_FOUND_STATUS = 404;
const CITY_NOT_FOUND_CODE = 'CITY_NOT_FOUND';
const CITY_NOT_FOUND_MESSAGE = 'Não encontramos essa cidade. Confira o nome e tente novamente.';

const router = express.Router();

function createEmptyLocation() {
  return { name: null, region: null, country: null };
}

async function resolveTarget(query) {
  if (query.type === 'coords') {
    return {
      coordinates: { latitude: query.latitude, longitude: query.longitude },
      location: createEmptyLocation()
    };
  }
  const place = await geocodeCity(query.city);
  if (place === null) {
    throw new HttpError(NOT_FOUND_STATUS, CITY_NOT_FOUND_CODE, CITY_NOT_FOUND_MESSAGE);
  }
  return {
    coordinates: { latitude: place.latitude, longitude: place.longitude },
    location: { name: place.name, region: place.region, country: place.country }
  };
}

async function handleWeatherRequest(req, res, next) {
  try {
    const query = parseWeatherQuery(req.query);
    const { coordinates, location } = await resolveTarget(query);
    const forecast = await fetchForecast(coordinates);
    res.status(WEATHER_STATUS_OK).json({ ...forecast, location });
  } catch (error) {
    next(error);
  }
}

router.get('/api/weather', handleWeatherRequest);

module.exports = router;
