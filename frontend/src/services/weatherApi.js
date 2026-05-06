const API_BASE_URL = '/api/weather';

async function parseResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Erro ao consultar o clima');
  }

  return data;
}

export const weatherApi = {
  async fetchByCity(city) {
    const response = await fetch(`${API_BASE_URL}?city=${encodeURIComponent(city)}`);
    return parseResponse(response);
  },

  async fetchByCoords(lat, lon) {
    const response = await fetch(`${API_BASE_URL}?lat=${lat}&lon=${lon}`);
    return parseResponse(response);
  }
};
