import React from 'react';
import { render, screen } from '@testing-library/react';
import CurrentWeather from '../components/CurrentWeather';

describe('CurrentWeather', () => {
  const mockData = {
    temperature_2m: 20.9,
    relative_humidity_2m: 81,
    wind_speed_10m: 4.9,
    weather_code: 0,
    precipitation: 0.0,
    is_day: 1
  };

  const mockDailyData = {
    uv_index_max: [6.2]
  };

  test('renderiza temperatura', () => {
    render(<CurrentWeather data={mockData} dailyData={mockDailyData} />);

    expect(screen.getByText('21')).toBeInTheDocument();
    expect(screen.getByText('°C')).toBeInTheDocument();
  });

  test('renderiza umidade', () => {
    render(<CurrentWeather data={mockData} dailyData={mockDailyData} />);

    expect(screen.getByText('81%')).toBeInTheDocument();
  });

  test('renderiza velocidade do vento', () => {
    render(<CurrentWeather data={mockData} dailyData={mockDailyData} />);

    expect(screen.getByText('4.9 km/h')).toBeInTheDocument();
  });

  test('renderiza precipitacao', () => {
    render(<CurrentWeather data={mockData} dailyData={mockDailyData} />);

    expect(screen.getByText('0 mm')).toBeInTheDocument();
  });

  test('renderiza UV index', () => {
    render(<CurrentWeather data={mockData} dailyData={mockDailyData} />);

    expect(screen.getByText('6.2')).toBeInTheDocument();
  });

  test('renderiza label da condicao climatica', () => {
    render(<CurrentWeather data={mockData} dailyData={mockDailyData} />);

    expect(screen.getByText('Céu limpo')).toBeInTheDocument();
  });

  test('renderiza barra de UV', () => {
    const { container } = render(<CurrentWeather data={mockData} dailyData={mockDailyData} />);

    expect(container.querySelector('.current-weather__uv-bar')).toBeInTheDocument();
    expect(container.querySelector('.current-weather__uv-fill')).toBeInTheDocument();
  });

  test('nao renderiza sem data', () => {
    const { container } = render(<CurrentWeather data={null} dailyData={mockDailyData} />);

    expect(container.firstChild).toBeNull();
  });

  test('usa UV 0 quando dailyData nao tem uv_index_max', () => {
    render(<CurrentWeather data={mockData} dailyData={null} />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
