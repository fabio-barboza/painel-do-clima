process.env.NODE_ENV = 'development';
process.env.CORS_ORIGINS = '*';

const ExternalError = require('../../src/services/externalError');

const { geocodeCity } = require('../../src/services/geocoding');
const { fetchForecast, sliceHourly24 } = require('../../src/services/forecast');
const { reverseGeocode } = require('../../src/services/reverseGeocoding');

let fetchSpy;

function okResponse(body) {
  return { ok: true, status: 200, json: () => Promise.resolve(body) };
}

function failResponse(status = 500) {
  return { ok: false, status, json: () => Promise.resolve({}) };
}

function abortError() {
  const error = new Error('The operation was aborted');
  error.name = 'AbortError';
  return error;
}

function spyFetch(handler) {
  fetchSpy = jest.spyOn(global, 'fetch');
  fetchSpy.mockImplementation(handler);
  return fetchSpy;
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Geocoding (Open-Meteo) — unidade', () => {
  test('monta a URL com name codificado, count=1, language=pt, format=json', async () => {
    spyFetch(async () => okResponse({
      results: [{ name: 'Curitiba', admin1: 'Paraná', country: 'Brasil', latitude: -25.43, longitude: -49.27 }]
    }));

    const place = await geocodeCity('São Paulo');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const calledUrl = fetchSpy.mock.calls[0][0];
    expect(calledUrl).toContain('name=S%C3%A3o+Paulo');
    expect(calledUrl).toContain('count=1');
    expect(calledUrl).toContain('language=pt');
    expect(calledUrl).toContain('format=json');
    expect(place).toEqual({ name: 'Curitiba', region: 'Paraná', country: 'Brasil', latitude: -25.43, longitude: -49.27 });
  });

  test('results vazio retorna null', async () => {
    spyFetch(async () => okResponse({ results: [] }));
    await expect(geocodeCity('CidadeInexistente')).resolves.toBeNull();
  });

  test('results ausente retorna null', async () => {
    spyFetch(async () => okResponse({}));
    await expect(geocodeCity('CidadeInexistente')).resolves.toBeNull();
  });

  test('não-2xx lança ExternalError', async () => {
    spyFetch(async () => failResponse(503));
    await expect(geocodeCity('Curitiba')).rejects.toBeInstanceOf(ExternalError);
  });

  test('timeout lança ExternalError', async () => {
    spyFetch(async () => { throw abortError(); });
    await expect(geocodeCity('Curitiba')).rejects.toBeInstanceOf(ExternalError);
  });
});

describe('Forecast (Open-Meteo) — unidade', () => {
  test('monta a URL com os parâmetros exatos da TechSpec', async () => {
    spyFetch(async () => okResponse({ timezone: 'America/Sao_Paulo', current: {}, hourly: {}, daily: {} }));

    await fetchForecast(-25.43, -49.27);

    const calledUrl = fetchSpy.mock.calls[0][0];
    const params = new URL(calledUrl).searchParams;
    expect(params.get('latitude')).toBe('-25.43');
    expect(params.get('longitude')).toBe('-49.27');
    expect(params.get('current')).toBe('temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,uv_index');
    expect(params.get('hourly')).toBe('temperature_2m,precipitation,weather_code');
    expect(params.get('daily')).toBe('temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,weather_code');
    expect(params.get('forecast_days')).toBe('7');
    expect(params.get('timezone')).toBe('auto');
    expect(params.get('wind_speed_unit')).toBe('kmh');
  });

  test('timeout lança ExternalError', async () => {
    spyFetch(async () => { throw abortError(); });
    await expect(fetchForecast(-25.43, -49.27)).rejects.toBeInstanceOf(ExternalError);
  });

  test('não-2xx lança ExternalError', async () => {
    spyFetch(async () => failResponse(500));
    await expect(fetchForecast(-25.43, -49.27)).rejects.toBeInstanceOf(ExternalError);
  });
});

describe('sliceHourly24 — unidade', () => {
  function buildHourly(total) {
    const time = [];
    const temperature_2m = [];
    const precipitation = [];
    const weather_code = [];
    for (let i = 0; i < total; i += 1) {
      const day = 27 + Math.floor(i / 24);
      const hour = String(i % 24).padStart(2, '0');
      time.push(`2026-10-${day}T${hour}:00`);
      temperature_2m.push(10 + (i % 10));
      precipitation.push(i % 3);
      weather_code.push(0);
    }
    return { time, temperature_2m, precipitation, weather_code };
  }

  test('hora 00h inicia no índice 0 e devolve 24 entradas', () => {
    const hourly = buildHourly(48);
    const slice = sliceHourly24(hourly, '2026-10-27T00:30');
    expect(slice.time).toHaveLength(24);
    expect(slice.time[0]).toBe('2026-10-27T00:00');
    expect(slice.time[23]).toBe('2026-10-27T23:00');
    expect(slice.temperature_2m).toEqual(hourly.temperature_2m.slice(0, 24));
  });

  test('hora 12h inicia no índice 12', () => {
    const hourly = buildHourly(48);
    const slice = sliceHourly24(hourly, '2026-10-27T12:30');
    expect(slice.time).toHaveLength(24);
    expect(slice.time[0]).toBe('2026-10-27T12:00');
    expect(slice.time[12]).toBe('2026-10-28T00:00');
  });

  test('hora 23h cruza o fim do dia (janela rolante)', () => {
    const hourly = buildHourly(48);
    const slice = sliceHourly24(hourly, '2026-10-27T23:30');
    expect(slice.time).toHaveLength(24);
    expect(slice.time[0]).toBe('2026-10-27T23:00');
    expect(slice.time[1]).toBe('2026-10-28T00:00');
    expect(slice.time[23]).toBe('2026-10-28T22:00');
  });

  test('sempre devolve exatamente 24 entradas', () => {
    const hourly = buildHourly(168);
    for (let hour = 0; hour < 24; hour += 1) {
      const slice = sliceHourly24(hourly, `2026-10-27T${String(hour).padStart(2, '0')}:30`);
      expect(slice.time).toHaveLength(24);
      expect(slice.precipitation).toHaveLength(24);
      expect(slice.weather_code).toHaveLength(24);
    }
  });

  test('hourly vazio devolve estruturas vazias', () => {
    const slice = sliceHourly24({}, '2026-10-27T12:30');
    expect(slice.time).toHaveLength(0);
  });
});

describe('Reverse geocoding (BigDataCloud) — unidade', () => {
  test('monta a URL com localityLanguage=pt e mapeia locality/principalSubdivision', async () => {
    spyFetch(async () => okResponse({ locality: 'Curitiba', principalSubdivision: 'Paraná', country: 'Brasil' }));

    const place = await reverseGeocode(-25.43, -49.27);

    const calledUrl = fetchSpy.mock.calls[0][0];
    expect(calledUrl).toContain('latitude=-25.43');
    expect(calledUrl).toContain('longitude=-49.27');
    expect(calledUrl).toContain('localityLanguage=pt');
    expect(place).toEqual({ name: 'Curitiba', region: 'Paraná' });
  });

  test('fallback para city quando locality é ausente', async () => {
    spyFetch(async () => okResponse({ city: 'Centro', principalSubdivision: 'Paraná' }));
    const place = await reverseGeocode(-25.43, -49.27);
    expect(place.name).toBe('Centro');
  });

  test('falha (timeout) retorna null', async () => {
    spyFetch(async () => { throw abortError(); });
    await expect(reverseGeocode(-25.43, -49.27)).resolves.toBeNull();
  });

  test('não-2xx retorna null', async () => {
    spyFetch(async () => failResponse(500));
    await expect(reverseGeocode(-25.43, -49.27)).resolves.toBeNull();
  });

  test('locality e city ausentes retornam null', async () => {
    spyFetch(async () => okResponse({ country: 'Brasil' }));
    await expect(reverseGeocode(-25.43, -49.27)).resolves.toBeNull();
  });
});

describe('Integração (pipeline geocoding → forecast → sliceHourly24) — fetch stubado', () => {
  test('cidade fictícia devolve 24 h coerentes', async () => {
    const times = [];
    const temps = [];
    for (let i = 0; i < 48; i += 1) {
      const day = 27 + Math.floor(i / 24);
      const hour = String(i % 24).padStart(2, '0');
      times.push(`2026-10-${day}T${hour}:00`);
      temps.push(15 + (i % 5));
    }

    spyFetch(async (url) => {
      const path = new URL(url).pathname;
      if (path.includes('/search')) {
        return okResponse({
          results: [{ name: 'Fictânia', admin1: 'Santa Catarina', country: 'Fictânia', latitude: -10, longitude: -50 }]
        });
      }
      if (path.includes('/forecast')) {
        return okResponse({
          timezone: 'America/Sao_Paulo',
          current: { temperature_2m: 20 },
          hourly: { time: times, temperature_2m: temps, precipitation: times.map(() => 0), weather_code: times.map(() => 0) }
        });
      }
      throw new Error(`URL inesperada: ${url}`);
    });

    const place = await geocodeCity('Fictância');
    expect(place).not.toBeNull();
    expect(place.latitude).toBe(-10);

    const forecast = await fetchForecast(place.latitude, place.longitude);
    expect(forecast.timezone).toBe('America/Sao_Paulo');

    const hourly24 = sliceHourly24(forecast.hourly, '2026-10-27T12:30');
    expect(hourly24.time).toHaveLength(24);
    expect(hourly24.time[0]).toBe('2026-10-27T12:00');
    expect(hourly24.temperature_2m).toEqual(
      forecast.hourly.temperature_2m.slice(12, 36)
    );
  });
});
