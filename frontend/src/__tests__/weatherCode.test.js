import { describe, expect, it } from 'vitest'
import {
  categorizeWeatherCode,
  deriveCurrent,
  formatDayPt,
  formatHour,
  getTheme,
  getUvIndex,
  getWeatherLabelPt,
} from '../utils/weatherCode.js'

const WMO_CODES_BY_CATEGORY = {
  clear: [0, 1],
  partly: [2],
  cloudy: [3],
  fog: [45, 48],
  rain: [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82],
  snow: [71, 73, 75, 77, 85, 86],
  thunder: [95, 96, 97, 99],
}

describe('categorizeWeatherCode', () => {
  it('mapeia todos os códigos WMO da tabela para a categoria correta', () => {
    for (const [category, codes] of Object.entries(WMO_CODES_BY_CATEGORY)) {
      for (const code of codes) {
        expect(categorizeWeatherCode(code)).toBe(category)
      }
    }
  })

  it('retorna categoria neutra para código desconhecido', () => {
    expect(categorizeWeatherCode(999)).toBe('cloudy')
  })
})

describe('getTheme', () => {
  it.each([
    ['clear', 'clear'],
    ['partly', 'clear'],
    ['cloudy', 'cloudy'],
    ['fog', 'cloudy'],
    ['rain', 'rain'],
    ['snow', 'rain'],
    ['thunder', 'rain'],
  ])('categoria "%s" → tema "%s"', (category, theme) => {
    expect(getTheme(category)).toBe(theme)
  })

  it('retorna tema neutro para categoria desconhecida', () => {
    expect(getTheme('whatever')).toBe('cloudy')
  })
})

describe('getWeatherLabelPt', () => {
  it('retorna descrição em PT-BR para todos os códigos da tabela', () => {
    const allCodes = Object.values(WMO_CODES_BY_CATEGORY).flat()
    for (const code of allCodes) {
      const label = getWeatherLabelPt(code)
      expect(typeof label).toBe('string')
      expect(label.trim().length).toBeGreaterThan(0)
      expect(label).not.toBe('Condição desconhecida')
    }
  })

  it('retorna labels específicos corretos', () => {
    expect(getWeatherLabelPt(0)).toBe('Céu limpo')
    expect(getWeatherLabelPt(2)).toBe('Parcialmente nublado')
    expect(getWeatherLabelPt(45)).toBe('Nevoeiro')
    expect(getWeatherLabelPt(61)).toBe('Chuva fraca')
    expect(getWeatherLabelPt(71)).toBe('Neve fraca')
    expect(getWeatherLabelPt(95)).toBe('Trovoada')
  })

  it('retorna fallback para código desconhecido', () => {
    expect(getWeatherLabelPt(123)).toBe('Condição desconhecida')
  })
})

describe('formatHour', () => {
  it('retorna a hora no formato HH:MM', () => {
    expect(formatHour('2026-10-17T14:00')).toBe('14:00')
    expect(formatHour('2026-10-17T09:00')).toBe('09:00')
    expect(formatHour('2026-10-17T23:00')).toBe('23:00')
  })
})

describe('formatDayPt', () => {
  it('retorna o dia em PT-BR no formato "seg., 19/10"', () => {
    expect(formatDayPt('2026-10-19')).toBe('seg., 19/10')
    expect(formatDayPt('2026-10-17')).toBe('sáb., 17/10')
    expect(formatDayPt('2026-10-18')).toBe('dom., 18/10')
    expect(formatDayPt('2026-10-20')).toBe('ter., 20/10')
  })

  it('aceita data com parte de hora e mantém o formato', () => {
    expect(formatDayPt('2026-10-19T00:00')).toBe('seg., 19/10')
  })
})

describe('getUvIndex', () => {
  it('deriva o UV do hourly na hora que casa com current.time', () => {
    const forecast = {
      current: { time: '2026-10-17T12:15' },
      hourly: {
        time: ['2026-10-17T11:00', '2026-10-17T12:00', '2026-10-17T13:00'],
        uv_index: [3.2, 5.5, 6.1],
      },
    }
    expect(getUvIndex(forecast)).toBe(5.5)
  })

  it('casa pela hora mesmo quando current.time tem minuto diferente do hourly', () => {
    const forecast = {
      current: { time: '2026-10-17T12:59' },
      hourly: { time: ['2026-10-17T12:00'], uv_index: [4.8] },
    }
    expect(getUvIndex(forecast)).toBe(4.8)
  })

  it('usa daily.uv_index_max do dia atual quando não há hourly', () => {
    const forecast = {
      current: { time: '2026-10-17T12:00' },
      daily: { time: ['2026-10-17', '2026-10-18'], uv_index_max: [6.8, 7.2] },
    }
    expect(getUvIndex(forecast)).toBe(6.8)
  })

  it('seleciona o dia correto no fallback para daily quando o dia atual não é o primeiro', () => {
    const forecast = {
      current: { time: '2026-10-18T10:00' },
      daily: { time: ['2026-10-17', '2026-10-18', '2026-10-19'], uv_index_max: [6.8, 7.2, 5.0] },
    }
    expect(getUvIndex(forecast)).toBe(7.2)
  })

  it('cai para daily quando o hourly não traz uv_index válido', () => {
    const forecast = {
      current: { time: '2026-10-17T12:00' },
      hourly: { time: ['2026-10-17T12:00'], uv_index: [null] },
      daily: { time: ['2026-10-17'], uv_index_max: [6.5] },
    }
    expect(getUvIndex(forecast)).toBe(6.5)
  })

  it('retorna null quando não há dados suficientes', () => {
    expect(getUvIndex({})).toBeNull()
    expect(getUvIndex({ current: { time: '2026-10-17T12:00' } })).toBeNull()
  })
})

describe('deriveCurrent', () => {
  it('monta a view model de condições atuais com o UV derivado', () => {
    const forecast = {
      current: {
        time: '2026-10-17T12:15',
        temperature_2m: 18.3,
        relative_humidity_2m: 72,
        precipitation: 0.5,
        weather_code: 2,
        wind_speed_10m: 11.4,
      },
      hourly: { time: ['2026-10-17T12:00'], uv_index: [5.5] },
    }
    expect(deriveCurrent(forecast)).toEqual({
      temperature: 18.3,
      humidity: 72,
      windSpeed: 11.4,
      uvIndex: 5.5,
      precipitation: 0.5,
      weatherCode: 2,
    })
  })

  it('retorna campos indefinidos e UV null para forecast vazio', () => {
    expect(deriveCurrent(undefined)).toEqual({
      temperature: undefined,
      humidity: undefined,
      windSpeed: undefined,
      uvIndex: null,
      precipitation: undefined,
      weatherCode: undefined,
    })
  })
})
