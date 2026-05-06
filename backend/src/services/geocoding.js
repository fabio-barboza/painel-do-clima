const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const TIMEOUT_MS = 15000;

async function geocode(cityName) {
  const params = new URLSearchParams({
    name: cityName,
    count: '1',
    language: 'pt',
    format: 'json'
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${GEOCODING_BASE_URL}?${params.toString()}`, {
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Erro ao consultar API de geocoding: ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      const notFoundError = new Error('Cidade não encontrada');
      notFoundError.statusCode = 404;
      throw notFoundError;
    }

    const result = data.results[0];
    return {
      name: result.name,
      latitude: result.latitude,
      longitude: result.longitude,
      timezone: result.timezone
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

module.exports = { geocode };
