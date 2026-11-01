const { reverseGeocodingApiUrl, requestTimeoutMs } = require('../config');

/**
 * @typedef {Object} Place
 * @property {string} name
 * @property {string} [region]
 */

/**
 * Best-effort reverse geocoding through BigDataCloud. Never throws.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<Place | null>}
 */
async function reverseGeocode(latitude, longitude) {
  const url = new URL(reverseGeocodingApiUrl);
  url.searchParams.set('latitude', latitude);
  url.searchParams.set('longitude', longitude);
  url.searchParams.set('localityLanguage', 'pt');

  let response;
  try {
    response = await fetch(url.href, { signal: AbortSignal.timeout(requestTimeoutMs) });
  } catch (error) {
    console.warn('[reverseGeocoding] falha na requisição;', error && error.message);
    return null;
  }

  if (!response.ok) {
    console.warn('[reverseGeocoding] resposta não-2xx', response.status);
    return null;
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    console.warn('[reverseGeocoding] corpo inválido', error && error.message);
    return null;
  }

  const name = (data && (data.locality || data.city)) || null;
  if (!name) {
    console.warn('[reverseGeocoding] locality/city ausente');
    return null;
  }

  /** @type {Place} */
  const place = {
    name,
    region: data.principalSubdivision || null
  };

  return place;
}

module.exports = { reverseGeocode };
