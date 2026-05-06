const express = require('express');
const { geocode } = require('../services/geocoding');
const { getForecast } = require('../services/forecast');

const router = express.Router();

router.get('/weather', async (req, res, next) => {
  try {
    const { city, lat, lon } = req.query;

    if (city) {
      return await handleCitySearch(city, res, next);
    }

    if (lat !== undefined || lon !== undefined) {
      return await handleCoordsSearch(lat, lon, res, next);
    }

    const err = new Error('Parâmetros inválidos');
    err.statusCode = 400;
    throw err;
  } catch (err) {
    next(err);
  }
});

async function handleCitySearch(city, res, next) {
  if (!city.trim()) {
    const err = new Error('Parâmetros inválidos');
    err.statusCode = 400;
    throw err;
  }

  const location = await geocode(city);
  const forecast = await getForecast(location.latitude, location.longitude);

  res.json({
    location: {
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      timezone: location.timezone
    },
    current: forecast.current,
    current_units: forecast.current_units,
    hourly: forecast.hourly,
    hourly_units: forecast.hourly_units,
    daily: forecast.daily,
    daily_units: forecast.daily_units
  });
}

async function handleCoordsSearch(lat, lon, res, next) {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    const err = new Error('Parâmetros inválidos');
    err.statusCode = 400;
    throw err;
  }

  const forecast = await getForecast(latitude, longitude);

  res.json({
    location: {
      latitude: forecast.latitude,
      longitude: forecast.longitude,
      timezone: forecast.timezone
    },
    current: forecast.current,
    current_units: forecast.current_units,
    hourly: forecast.hourly,
    hourly_units: forecast.hourly_units,
    daily: forecast.daily,
    daily_units: forecast.daily_units
  });
}

module.exports = router;
