import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../components/SearchBar';

describe('SearchBar', () => {
  const mockOnSearch = vi.fn();
  const mockOnGeoSearch = vi.fn();
  const mockOnGeoError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renderiza campo de busca e botoes', () => {
    render(
      <SearchBar onSearch={mockOnSearch} onGeoSearch={mockOnGeoSearch} onGeoError={mockOnGeoError} />
    );

    expect(screen.getByPlaceholderText('Buscar cidade...')).toBeInTheDocument();
    expect(screen.getByText('Buscar')).toBeInTheDocument();
    expect(screen.getByLabelText('Usar minha localização')).toBeInTheDocument();
  });

  test('dispara onSearch ao submeter formulario com cidade', () => {
    render(
      <SearchBar onSearch={mockOnSearch} onGeoSearch={mockOnGeoSearch} onGeoError={mockOnGeoError} />
    );

    const input = screen.getByPlaceholderText('Buscar cidade...');
    fireEvent.change(input, { target: { value: 'São Paulo' } });
    fireEvent.submit(input.closest('form'));

    expect(mockOnSearch).toHaveBeenCalledWith('São Paulo');
  });

  test('nao dispara onSearch com campo vazio', () => {
    render(
      <SearchBar onSearch={mockOnSearch} onGeoSearch={mockOnGeoSearch} onGeoError={mockOnGeoError} />
    );

    const input = screen.getByPlaceholderText('Buscar cidade...');
    fireEvent.submit(input.closest('form'));

    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  test('nao dispara onSearch com apenas espacos', () => {
    render(
      <SearchBar onSearch={mockOnSearch} onGeoSearch={mockOnGeoSearch} onGeoError={mockOnGeoError} />
    );

    const input = screen.getByPlaceholderText('Buscar cidade...');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.submit(input.closest('form'));

    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  test('dispara onGeoSearch ao obter localizacao', () => {
    const mockGetCurrentPosition = vi.fn((success) => {
      success({ coords: { latitude: -23.55, longitude: -46.63 } });
    });

    Object.defineProperty(global.navigator, 'geolocation', {
      value: { getCurrentPosition: mockGetCurrentPosition },
      writable: true,
      configurable: true
    });

    render(
      <SearchBar onSearch={mockOnSearch} onGeoSearch={mockOnGeoSearch} onGeoError={mockOnGeoError} />
    );

    const geoButton = screen.getByLabelText('Usar minha localização');
    fireEvent.click(geoButton);

    expect(mockOnGeoSearch).toHaveBeenCalledWith(-23.55, -46.63);
  });

  test('dispara onGeoError quando permissao e negada', () => {
    const mockGetCurrentPosition = vi.fn((success, error) => {
      error({ code: 1, PERMISSION_DENIED: 1, message: 'denied' });
    });

    Object.defineProperty(global.navigator, 'geolocation', {
      value: { getCurrentPosition: mockGetCurrentPosition },
      writable: true,
      configurable: true
    });

    render(
      <SearchBar onSearch={mockOnSearch} onGeoSearch={mockOnGeoSearch} onGeoError={mockOnGeoError} />
    );

    const geoButton = screen.getByLabelText('Usar minha localização');
    fireEvent.click(geoButton);

    expect(mockOnGeoError).toHaveBeenCalledWith('Permissão de localização negada');
  });

  test('dispara onGeoError quando geolocation nao e suportado', () => {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: undefined,
      writable: true,
      configurable: true
    });

    render(
      <SearchBar onSearch={mockOnSearch} onGeoSearch={mockOnGeoSearch} onGeoError={mockOnGeoError} />
    );

    const geoButton = screen.getByLabelText('Usar minha localização');
    fireEvent.click(geoButton);

    expect(mockOnGeoError).toHaveBeenCalledWith('Geolocalização não suportada pelo navegador');
  });
});
