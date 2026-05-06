import React from 'react';
import { render } from '@testing-library/react';
import HourlyForecast from '../components/HourlyForecast';

describe('HourlyForecast', () => {
  const mockHourlyData = {
    time: Array.from({ length: 24 }, (_, i) => `2026-05-06T${String(i).padStart(2, '0')}:00`),
    temperature_2m: Array.from({ length: 24 }, (_, i) => 20 + Math.sin(i / 4) * 5),
    precipitation: Array.from({ length: 24 }, () => Math.random() * 2)
  };

  test('renderiza o componente com dados validos', () => {
    const { container } = render(<HourlyForecast hourlyData={mockHourlyData} />);

    expect(container.querySelector('.hourly-forecast')).toBeInTheDocument();
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  test('renderiza titulo da secao', () => {
    render(<HourlyForecast hourlyData={mockHourlyData} />);

    expect(document.querySelector('.hourly-forecast__title')).toBeInTheDocument();
  });

  test('nao renderiza sem dados', () => {
    const { container } = render(<HourlyForecast hourlyData={null} />);

    expect(container.firstChild).toBeNull();
  });

  test('nao renderiza sem time nos dados', () => {
    const { container } = render(<HourlyForecast hourlyData={{ temperature_2m: [], precipitation: [] }} />);

    expect(container.firstChild).toBeNull();
  });

  test('renderiza container do grafico com classe correta', () => {
    const { container } = render(<HourlyForecast hourlyData={mockHourlyData} />);

    expect(container.querySelector('.hourly-forecast__chart')).toBeInTheDocument();
  });

  test('renderiza com array vazio de dados', () => {
    const { container } = render(
      <HourlyForecast hourlyData={{ time: [], temperature_2m: [], precipitation: [] }} />
    );

    expect(container.querySelector('.hourly-forecast')).toBeInTheDocument();
  });
});
