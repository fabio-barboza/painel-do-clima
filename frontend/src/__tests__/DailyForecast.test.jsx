import React from 'react';
import { render, screen } from '@testing-library/react';
import DailyForecast from '../components/DailyForecast';

describe('DailyForecast', () => {
  const mockDailyData = {
    time: [
      '2026-05-06',
      '2026-05-07',
      '2026-05-08',
      '2026-05-09',
      '2026-05-10',
      '2026-05-11',
      '2026-05-12'
    ],
    weather_code: [0, 3, 61, 1, 0, 45, 95],
    temperature_2m_max: [27.2, 25.0, 22.5, 24.0, 28.0, 23.0, 20.0],
    temperature_2m_min: [16.1, 15.0, 14.0, 16.0, 17.0, 15.5, 13.0],
    uv_index_max: [6.2, 4.0, 2.0, 5.0, 7.0, 3.0, 1.0],
    precipitation_sum: [1.5, 0.0, 5.0, 0.5, 0.0, 2.0, 8.0]
  };

  test('renderiza 7 cards para 7 dias', () => {
    const { container } = render(<DailyForecast dailyData={mockDailyData} />);

    expect(container.querySelectorAll('.daily-forecast__card')).toHaveLength(7);
  });

  test('renderiza "Hoje" para o primeiro dia', () => {
    render(<DailyForecast dailyData={mockDailyData} />);

    expect(screen.getByText('Hoje')).toBeInTheDocument();
  });

  test('renderiza temperaturas min e max', () => {
    render(<DailyForecast dailyData={mockDailyData} />);

    expect(screen.getByText('27°')).toBeInTheDocument();
    expect(screen.getByText('13°')).toBeInTheDocument();
  });

  test('renderiza precipitacao', () => {
    render(<DailyForecast dailyData={mockDailyData} />);

    expect(screen.getByText('1.5 mm')).toBeInTheDocument();
    expect(screen.getByText('5 mm')).toBeInTheDocument();
  });

  test('renderiza barras de temperatura', () => {
    const { container } = render(<DailyForecast dailyData={mockDailyData} />);

    expect(container.querySelectorAll('.daily-forecast__bar-fill')).toHaveLength(7);
  });

  test('nao renderiza sem dados', () => {
    const { container } = render(<DailyForecast dailyData={null} />);

    expect(container.firstChild).toBeNull();
  });

  test('renderiza titulo da secao', () => {
    render(<DailyForecast dailyData={mockDailyData} />);

    expect(screen.getByText('Previsão de 7 dias')).toBeInTheDocument();
  });

  test('renderiza container de cards', () => {
    const { container } = render(<DailyForecast dailyData={mockDailyData} />);

    expect(container.querySelector('.daily-forecast__cards')).toBeInTheDocument();
  });
});
