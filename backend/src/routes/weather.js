const express = require('express');
const { geocodeCity, getForecast, CityNotFoundError } = require('../services/openMeteo');

const MAX_LATITUDE = 90;
const MAX_LONGITUDE = 180;

const router = express.Router();

function parseCoord(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    return null;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function sendValidation(res, message) {
  return res.status(400).json({ error: 'VALIDATION', message });
}

function sendCityNotFound(res, message) {
  return res.status(404).json({ error: 'CITY_NOT_FOUND', message });
}

function sendInternal(res, error) {
  console.error(JSON.stringify({
    level: 'error',
    event: 'weather_internal_error',
    message: error && error.message ? error.message : 'Erro inesperado'
  }));
  return res.status(500).json({
    error: 'INTERNAL',
    message: 'Falha ao consultar o serviço de previsão.'
  });
}

async function respondByCoords(res, latitude, longitude) {
  const forecast = await getForecast(latitude, longitude);
  const location = { latitude, longitude, timezone: forecast.timezone };
  return res.status(200).json({ location, forecast });
}

async function respondByCity(res, city) {
  const location = await geocodeCity(city);
  const forecast = await getForecast(location.latitude, location.longitude);
  return res.status(200).json({ location, forecast });
}

router.get('/', async (req, res) => {
  const { city, lat, lon } = req.query;
  const hasCity = typeof city === 'string' && city.trim() !== '';
  const hasCoords = lat !== undefined || lon !== undefined;

  if (hasCity && hasCoords) {
    return sendValidation(res, 'Informe apenas \'city\' ou apenas \'lat\' e \'lon\'.');
  }

  if (!hasCity && !hasCoords) {
    return sendValidation(res, 'Informe \'city\' ou \'lat\' e \'lon\'.');
  }

  if (hasCoords) {
    const latitude = parseCoord(lat);
    const longitude = parseCoord(lon);
    if (latitude === null || longitude === null || Math.abs(latitude) > MAX_LATITUDE || Math.abs(longitude) > MAX_LONGITUDE) {
      return sendValidation(res, 'Coordenadas \'lat\' e \'lon\' inválidas.');
    }
    try {
      return await respondByCoords(res, latitude, longitude);
    } catch (error) {
      return sendInternal(res, error);
    }
  }

  try {
    return await respondByCity(res, city.trim());
  } catch (error) {
    if (error instanceof CityNotFoundError) {
      return sendCityNotFound(res, error.message);
    }
    return sendInternal(res, error);
  }
});

module.exports = router;
