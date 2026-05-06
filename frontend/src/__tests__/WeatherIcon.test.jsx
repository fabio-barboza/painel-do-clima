import React from 'react';
import { render } from '@testing-library/react';
import WeatherIcon from '../components/WeatherIcon';

describe('WeatherIcon', () => {
  test('renderiza icone de sol para codigo 0 com isDay true', () => {
    const { container } = render(<WeatherIcon code={0} isDay={true} />);

    expect(container.querySelector('.weather-icon--sun')).toBeInTheDocument();
  });

  test('renderiza icone de lua para codigo 0 com isDay false', () => {
    const { container } = render(<WeatherIcon code={0} isDay={false} />);

    expect(container.querySelector('.weather-icon__moon')).toBeInTheDocument();
  });

  test('renderiza icone de nublado para codigo 3', () => {
    const { container } = render(<WeatherIcon code={3} />);

    expect(container.querySelector('.weather-icon--cloud')).toBeInTheDocument();
  });

  test('renderiza icone de chuva para codigo 61', () => {
    const { container } = render(<WeatherIcon code={61} />);

    expect(container.querySelector('.weather-icon--rain')).toBeInTheDocument();
  });

  test('renderiza icone de tempestade para codigo 95', () => {
    const { container } = render(<WeatherIcon code={95} />);

    expect(container.querySelector('.weather-icon--thunder')).toBeInTheDocument();
  });

  test('renderiza icone de neve para codigo 71', () => {
    const { container } = render(<WeatherIcon code={71} />);

    expect(container.querySelector('.weather-icon--snow')).toBeInTheDocument();
  });

  test('renderiza icone de garoa para codigo 51', () => {
    const { container } = render(<WeatherIcon code={51} />);

    expect(container.querySelector('.weather-icon--drizzle')).toBeInTheDocument();
  });

  test('renderiza icone de nevoeiro para codigo 45', () => {
    const { container } = render(<WeatherIcon code={45} />);

    expect(container.querySelector('.weather-icon--fog')).toBeInTheDocument();
  });

  test('renderiza icone parcialmente nublado dia para codigo 1', () => {
    const { container } = render(<WeatherIcon code={1} isDay={true} />);

    expect(container.querySelector('.weather-icon__sun-small')).toBeInTheDocument();
  });

  test('renderiza icone desconhecido para codigo invalido', () => {
    const { container } = render(<WeatherIcon code={999} />);

    expect(container.querySelector('text')).toBeInTheDocument();
  });
});
