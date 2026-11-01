import { describe, test, expect } from 'vitest'
import { formatDayLabel, formatShortDate } from '../lib/format.js'
import { weatherCodeInfo } from '../lib/weatherCodes.js'
import { computeScales, rainBarHeights } from '../lib/chart.js'

describe('Integração: composição das 3 libs de domínio', () => {
  const horas = Array.from({ length: 24 }, (_, i) => ({
    time: `2026-10-27T${String(i).padStart(2, '0')}:00`,
    temperature_2m: 18 + Math.round(6 * Math.sin(i / 3)),
    precipitation: [0, 0, 0, 0, 0.4, 1.2, 0, 0, 3, 0, 0, 0, 2, 0, 0, 0, 0.5, 0, 0, 0, 0, 0, 0, 0][i],
    weather_code: [0, 0, 1, 1, 2, 61, 61, 2, 3, 3, 95, 96, 63, 63, 2, 1, 0, 0, 45, 45, 3, 3, 0, 0][i],
  }))

  const dias = ['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02']
  const codes = [0, 63, 95, 85, 2, 51, 1]

  test('weatherCodeInfo → ícone/tint coerentes por hora e dia', () => {
    const tintPorCodigo = {}
    for (const code of codes) {
      const info = weatherCodeInfo(code)
      expect(['sun', 'cloud-sun', 'cloud', 'rain', 'storm']).toContain(info.icon)
      expect(['clear', 'cloudy', 'rain']).toContain(info.tint)
      tintPorCodigo[code] = info.tint
    }
    expect(tintPorCodigo[0]).toBe('clear')
    expect(tintPorCodigo[63]).toBe('rain')
    expect(tintPorCodigo[95]).toBe('rain')
  })

  test('formatDayLabel/formatShortDate → rótulos dos dia', () => {
    expect(formatDayLabel(dias[0], 0)).toBe('Hoje')
    expect(formatDayLabel(dias[1], 1)).not.toBe('Hoje')
    const datas = dias.map(d => formatShortDate(d))
    // pt-BR correto: outubro → "out"; a TechSpec lista "16 ago" apenas como exemplo de agosto
    expect(datas[0]).toBe('27 out')
    expect(formatShortDate('2026-08-16')).toBe('16 ago')
    // novembro troca a abreviação (dia sem padding à esquerda)
    expect(datas[6]).toBe('2 nov')
  })

  test('computeScales + rainBarHeights → entradas coerentes para o HourlyChart', () => {
    const temps = horas.map(h => h.temperature_2m)
    const precips = horas.map(h => h.precipitation)
    const scales = computeScales(temps)

    expect(scales.X(0)).toBe(44)
    expect(scales.X(23)).toBe(744)
    const alturas = rainBarHeights(precips)

    expect(alturas.length).toBe(24)
    expect(alturas[0]).toBe(0)
    expect(alturas[4]).toBeGreaterThanOrEqual(2)
    for (const a of alturas) {
      expect(a).toBeGreaterThanOrEqual(0)
      expect(a).toBeLessThanOrEqual(0.28 * 232)
    }
    const pontos = temps.map((t, i) => [scales.X(i), scales.Y(t)])
    expect(pontos.length).toBe(24)
    expect(pontos[0][0]).toBe(44)
  })
})
