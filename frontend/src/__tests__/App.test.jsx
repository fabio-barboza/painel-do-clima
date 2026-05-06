import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../App';
import { useWeather } from '../hooks/useWeather';
import { weatherApi } from '../services/weatherApi';

vi.mock('../services/weatherApi');

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renderiza hero e SearchBar no estado inicial', () => {
    render(<App />);

    expect(screen.getByText('Painel do Clima')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar cidade...')).toBeInTheDocument();
    expect(screen.getByText('Buscar')).toBeInTheDocument();
  });

  test('exibe skeletons durante carregamento', () => {
    vi.spyOn(weatherApi, 'fetchByCity').mockImplementation(() => new Promise(() => {}));

    render(<App />);

    const input = screen.getByPlaceholderText('Buscar cidade...');
    fireEvent.change(input, { target: { value: 'São Paulo' } });
    fireEvent.submit(input.closest('form'));

    expect(screen.getByText('Painel do Clima')).toBeInTheDocument();
  });

  test('exibe dados apos busca com sucesso', async () => {
    const mockPayload = {
      location: { name: 'São Paulo', latitude: -23.55, longitude: -46.63, timezone: 'America/Sao_Paulo' },
      current: { temperature_2m: 20.9, relative_humidity_2m: 81, wind_speed_10m: 4.9, weather_code: 0, precipitation: 0.0, is_day: 1 },
      current_units: {},
      hourly: { time: ['2026-05-06T00:00'], temperature_2m: [19.0], precipitation: [0.0] },
      hourly_units: {},
      daily: { time: ['2026-05-06'], weather_code: [0], temperature_2m_max: [27.2], temperature_2m_min: [16.1], uv_index_max: [6.2], precipitation_sum: [1.5] },
      daily_units: {}
    };

    weatherApi.fetchByCity.mockResolvedValue(mockPayload);

    render(<App />);

    const input = screen.getByPlaceholderText('Buscar cidade...');
    fireEvent.change(input, { target: { value: 'São Paulo' } });
    fireEvent.submit(input.closest('form'));

    const locationText = await screen.findByText('São Paulo');
    expect(locationText).toBeInTheDocument();
  });

  test('exibe mensagem de erro quando busca falha', async () => {
    weatherApi.fetchByCity.mockRejectedValue(new Error('Cidade não encontrada'));

    render(<App />);

    const input = screen.getByPlaceholderText('Buscar cidade...');
    fireEvent.change(input, { target: { value: 'InvalidCity' } });
    fireEvent.submit(input.closest('form'));

    const errorText = await screen.findByText('Cidade não encontrada');
    expect(errorText).toBeInTheDocument();
  });

  test('exibe retry button no erro', async () => {
    weatherApi.fetchByCity.mockRejectedValue(new Error('Erro'));

    render(<App />);

    const input = screen.getByPlaceholderText('Buscar cidade...');
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.submit(input.closest('form'));

    const retryButton = await screen.findByText('Tentar novamente');
    expect(retryButton).toBeInTheDocument();
  });

  test('exibe "Sua localização" quando dados via coords sem nome', async () => {
    const mockPayload = {
      location: { latitude: -23.55, longitude: -46.63, timezone: 'America/Sao_Paulo' },
      current: { temperature_2m: 20.9, relative_humidity_2m: 81, wind_speed_10m: 4.9, weather_code: 0, precipitation: 0.0, is_day: 1 },
      current_units: {},
      hourly: { time: ['2026-05-06T00:00'], temperature_2m: [19.0], precipitation: [0.0] },
      hourly_units: {},
      daily: { time: ['2026-05-06'], weather_code: [0], temperature_2m_max: [27.2], temperature_2m_min: [16.1], uv_index_max: [6.2], precipitation_sum: [1.5] },
      daily_units: {}
    };

    weatherApi.fetchByCoords.mockResolvedValue(mockPayload);

    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: (success) => success({ coords: { latitude: -23.55, longitude: -46.63 } })
      },
      writable: true,
      configurable: true
    });

    render(<App />);

    const geoButton = screen.getByLabelText('Usar minha localização');
    fireEvent.click(geoButton);

    const locationText = await screen.findByText('Sua localização');
    expect(locationText).toBeInTheDocument();
  });
});
