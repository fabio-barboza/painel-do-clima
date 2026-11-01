const { geocodingApiUrl, requestTimeoutMs } = require('../config');
const ExternalError = require('./externalError');

/**
 * @typedef {Object} Place
 * @property {string} name
 * @property {string} [region]
 * @property {string} [country]
 * @property {number} latitude
 * @property {number} longitude
 */

/**
 * Resolve a city name to coordinates through Open-Meteo geocoding.
 * @param {string} name
 * @returns {Promise<Place | null>}
 */
async function geocodeCity(name) {
  const url = new URL(geocodingApiUrl);
  url.searchParams.set('name', name);
  url.searchParams.set('count', '1');
  url.searchParams.set('language', 'pt');
  url.searchParams.set('format', 'json');

  let response;
  try {
    response = await fetch(url.href, { signal: AbortSignal.timeout(requestTimeoutMs) });
  } catch (error) {
    if (error && error.name === 'AbortError') {
      throw new ExternalError('Timeout na consulta de geocoding.', 502);
    }
    throw new ExternalError('Falha na consulta de geocoding.', 502);
  }

  if (!response.ok) {
    throw new ExternalError('Falha na consulta de geocoding.', 502);
  }

  const data = await response.json();
  const first = data && data.results && data.results[0];
  if (!first || !first.name) {
    return null;
  }

  /** @type {Place} */
  const place = {
    name: first.name,
    region: first.admin1 || null,
    country: first.country || null,
    latitude: first.latitude,
    longitude: first.longitude
  };

  return place;
}

module.exports = { geocodeCity };
