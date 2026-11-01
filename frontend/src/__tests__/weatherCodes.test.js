import { describe, test, expect } from 'vitest'
import { weatherCodeInfo, uvLabel, windCardinal } from '../lib/weatherCodes.js'

const CODIGO_DESCONHECIDO = 987

describe('weatherCodes.js', () => {
  describe('weatherCodeInfo', () => {
    test('mapa WMO completo por código', () => {
      const esperado = {
        0: { icon: 'sun', tint: 'clear' },
        1: { icon: 'sun', tint: 'clear' },
        2: { icon: 'cloud-sun', tint: 'cloudy' },
        3: { icon: 'cloud', tint: 'cloudy' },
        45: { icon: 'cloud', tint: 'cloudy' },
        48: { icon: 'cloud', tint: 'cloudy' },
        51: { icon: 'rain', tint: 'rain' },
        53: { icon: 'rain', tint: 'rain' },
        55: { icon: 'rain', tint: 'rain' },
        56: { icon: 'rain', tint: 'rain' },
        57: { icon: 'rain', tint: 'rain' },
        61: { icon: 'rain', tint: 'rain' },
        63: { icon: 'rain', tint: 'rain' },
        65: { icon: 'rain', tint: 'rain' },
        66: { icon: 'rain', tint: 'rain' },
        67: { icon: 'rain', tint: 'rain' },
        71: { icon: 'cloud', tint: 'cloudy' },
        73: { icon: 'cloud', tint: 'cloudy' },
        75: { icon: 'cloud', tint: 'cloudy' },
        77: { icon: 'cloud', tint: 'cloudy' },
        80: { icon: 'rain', tint: 'rain' },
        81: { icon: 'rain', tint: 'rain' },
        82: { icon: 'rain', tint: 'rain' },
        85: { icon: 'cloud', tint: 'cloudy' },
        86: { icon: 'cloud', tint: 'cloudy' },
        95: { icon: 'storm', tint: 'rain' },
        96: { icon: 'storm', tint: 'rain' },
        99: { icon: 'storm', tint: 'rain' },
      }
      for (const [codigo, esperadoCode] of Object.entries(esperado)) {
        const info = weatherCodeInfo(Number(codigo))
        expect(info.icon, `WMO ${codigo}: ícone`).toBe(esperadoCode.icon)
        expect(info.tint, `WMO ${codigo}: tint`).toBe(esperadoCode.tint)
        expect(info.label).toEqual(expect.any(String))
        expect(info.color).toEqual(expect.any(String))
      }
    })

    test('ícone e cor coerentes por variante', () => {
      expect(weatherCodeInfo(0).icon).toBe('sun')
      expect(weatherCodeInfo(0).color).toBe('#ffd76a')
      expect(weatherCodeInfo(3).icon).toBe('cloud')
      expect(weatherCodeInfo(3).color).toBe('#c9d6f2')
      expect(weatherCodeInfo(63).icon).toBe('rain')
      expect(weatherCodeInfo(63).color).toBe('#7cc4ff')
      expect(weatherCodeInfo(95).icon).toBe('storm')
      expect(weatherCodeInfo(96).color).toBe('#c9b8ff')
    })

    test('fallback defensivo para código desconhecido', () => {
      const info = weatherCodeInfo(CODIGO_DESCONHECIDO)
      expect(info).toEqual({ label: 'Nublado', icon: 'cloud', color: '#c9d6f2', tint: 'cloudy' })
    })
  })

  describe('uvLabel (faixas WHO 0–2/3–5/6–7/8–10/11+)', () => {
    test('casos da TechSpec', () => {
      expect(uvLabel(2.9)).toBe('Moderado')
      expect(uvLabel(5)).toBe('Moderado')
      expect(uvLabel(6)).toBe('Alto')
      expect(uvLabel(8)).toBe('Muito Alto')
      expect(uvLabel(11)).toBe('Extremo')
    })
    test('extremos das faixas', () => {
      expect(uvLabel(0)).toBe('Baixo')
      expect(uvLabel(2)).toBe('Baixo')
      expect(uvLabel(3)).toBe('Moderado')
      expect(uvLabel(7)).toBe('Alto')
      expect(uvLabel(10)).toBe('Muito Alto')
    })
  })

  describe('windCardinal (16 pontos, índice round(deg/22.5) % 16)', () => {
    test('casos da TechSpec', () => {
      expect(windCardinal(0)).toBe('N')
      expect(windCardinal(22.5)).toBe('NNE')
      expect(windCardinal(90)).toBe('L')
      expect(windCardinal(315)).toBe('NO')
    })
    test('completude dos 16 pontos', () => {
      expect(windCardinal(45)).toBe('NE')
      expect(windCardinal(180)).toBe('S')
      expect(windCardinal(270)).toBe('O')
      expect(windCardinal(360)).toBe('N')
    })
  })
})
