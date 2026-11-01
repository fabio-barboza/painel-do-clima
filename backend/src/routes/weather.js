const express = require('express');

const { geocodeCity } = require('../services/geocoding');
const { fetchForecast, sliceHourly24 } = require('../services/forecast');
const { reverseGeocode } = require('../services/reverseGeocoding');

const ExternalError = require('../services/externalError');

const MIN_LATITUDE = -90;
const MAX_LATITUDE = 90;
const MIN_LONGITUDE = -180;
const MAX_LONGITUDE = 180;

const router = express.Router();

function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

function resolveDisplay(name, region) {
  if (name && region && region !== name) {
    return `${name}, ${region}`;
  }
  return name || null;
}

function placeToCity(place) {
  return {
    name: place.name,
    region: place.region || null,
    country: place.country || null,
    display: resolveDisplay(place.name, place.region),
    latitude: place.latitude,
    longitude: place.longitude
  };
}

function buildEnvelope(cityObj, forecast) {
  return {
    city: cityObj,
    timezone: forecast.timezone,
    utc_offset_seconds: forecast.utc_offset_seconds,
    current: forecast.current,
    hourly: sliceHourly24(forecast.hourly, forecast.current.time),
    daily: forecast.daily
  };
}

function parseCoords(query) {
  const hasLatitude = query.latitude !== undefined && query.latitude !== '';
  const hasLongitude = query.longitude !== undefined && query.longitude !== '';
  const hasCoords = hasLatitude || hasLongitude;

  let latitude = null;
  let longitude = null;
  let valid = true;

  if (hasLatitude) {
    latitude = Number(query.latitude);
    if (!Number.isFinite(latitude)) {
      valid = false;
    }
  }
  if (hasLongitude) {
    longitude = Number(query.longitude);
    if (!Number.isFinite(longitude)) {
      valid = false;
    }
  }

  if (hasCoords && hasLatitude !== hasLongitude) {
    valid = false;
  }

  if (hasCoords && (
    !valid
    || latitude < MIN_LATITUDE
    || latitude > MAX_LATITUDE
    || longitude < MIN_LONGITUDE
    || longitude > MAX_LONGITUDE
  )) {
    valid = false;
  }

  return { hasCoords, latitude, longitude, valid };
}

async function handleCity(req, res, next) {
  const place = await geocodeCity(req.query.city.trim());
  if (!place) {
    return sendError(res, 404, 'Cidade não encontrada.');
  }
  const forecast = await fetchForecast(place.latitude, place.longitude);
  return res.status(200).json(buildEnvelope(placeToCity(place), forecast));
}

async function handleCoords(req, res, next) {
  const { latitude, longitude } = req.coords;

  const [forecast, reverse] = await Promise.all([
    fetchForecast(latitude, longitude),
    reverseGeocode(latitude, longitude)
  ]);

  const cityObj = {
    name: reverse ? reverse.name : null,
    region: reverse ? reverse.region : null,
    country: null,
    display: resolveDisplay(reverse && reverse.name, reverse && reverse.region),
    latitude,
    longitude
  };

  return res.status(200).json(buildEnvelope(cityObj, forecast));
}

router.get('/', (req, res, next) => {
  const rawCity = req.query.city;
  const city = rawCity === undefined ? undefined : String(rawCity).trim();

  const coords = parseCoords(req.query);

  if (city) {
    if (coords.hasCoords) {
      return sendError(res, 400, 'Informe apenas o nome da cidade ou apenas coordenadas, não ambos.');
    }
    return (async () => {
      try {
        return await handleCity(req, res, next);
      } catch (err) {
        next(err);
      }
    })();
  }

  if (!coords.hasCoords) {
    return sendError(res, 400, 'Informe um nome de cidade ou coordenadas válidas.');
  }

  if (!coords.valid) {
    return sendError(res, 400, 'Coordenadas inválidas.');
  }

  req.coords = { latitude: coords.latitude, longitude: coords.longitude };

  return (async () => {
    try {
      return await handleCoords(req, res, next);
    } catch (err) {
      next(err);
    }
  })();
});

module.exports = router;
