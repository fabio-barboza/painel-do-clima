import { weatherCodes } from '../utils/weatherCodes';

describe('weatherCodes', () => {
  describe('getLabel', () => {
    test('retorna label correto para codigo 0', () => {
      expect(weatherCodes.getLabel(0)).toBe('Céu limpo');
    });

    test('retorna label correto para codigo 3', () => {
      expect(weatherCodes.getLabel(3)).toBe('Nublado');
    });

    test('retorna label correto para codigo 61', () => {
      expect(weatherCodes.getLabel(61)).toBe('Chuva leve');
    });

    test('retorna label correto para codigo 95', () => {
      expect(weatherCodes.getLabel(95)).toBe('Tempestade');
    });

    test('retorna label padrao para codigo desconhecido', () => {
      expect(weatherCodes.getLabel(999)).toBe('Desconhecido');
    });
  });

  describe('getIconName', () => {
    test('retorna icone correto para ceu limpo', () => {
      expect(weatherCodes.getIconName(0)).toBe('clear');
    });

    test('retorna icone correto para chuva', () => {
      expect(weatherCodes.getIconName(61)).toBe('rain');
    });

    test('retorna icone correto para neve', () => {
      expect(weatherCodes.getIconName(71)).toBe('snow');
    });

    test('retorna icone correto para tempestade', () => {
      expect(weatherCodes.getIconName(95)).toBe('thunderstorm');
    });

    test('retorna icone padrao para codigo desconhecido', () => {
      expect(weatherCodes.getIconName(999)).toBe('unknown');
    });
  });

  describe('getThemeColor', () => {
    test('retorna cor azul para ceu limpo', () => {
      expect(weatherCodes.getThemeColor(0)).toBe('#4A90D9');
    });

    test('retorna cor cinza para nublado', () => {
      expect(weatherCodes.getThemeColor(3)).toBe('#9E9E9E');
    });

    test('retorna cor azul mais escuro para chuva forte', () => {
      expect(weatherCodes.getThemeColor(65)).toBe('#1565C0');
    });

    test('retorna cor para nevoeiro', () => {
      expect(weatherCodes.getThemeColor(45)).toBe('#B0BEC5');
    });

    test('retorna cor padrao para codigo desconhecido', () => {
      expect(weatherCodes.getThemeColor(999)).toBe('#9E9E9E');
    });
  });

  describe('cobertura completa de codigos WMO', () => {
    const expectedCodes = [0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99];

    test.each(expectedCodes)('codigo WMO %d retorna label valido', (code) => {
      expect(weatherCodes.getLabel(code)).not.toBe('Desconhecido');
    });

    test.each(expectedCodes)('codigo WMO %d retorna iconName valido', (code) => {
      expect(weatherCodes.getIconName(code)).not.toBe('unknown');
    });
  });
});
