import { describe, test, expect } from 'vitest'
import { formatTimeFromIso, formatDayLabel, formatShortDate, formatNumber } from '../lib/format.js'

describe('format.js', () => {
  describe('formatTimeFromIso', () => {
    test('faz slice direto do ISO local da cidade, sem passar por Date', () => {
      expect(formatTimeFromIso('2026-10-27T19:15')).toBe('19:15')
      expect(formatTimeFromIso('2026-01-03T08:05')).toBe('08:05')
    })
    test('é determinística: mesmo ISO gera mesmo resultado sem Date', () => {
      expect(formatTimeFromIso('2026-10-27T23:40')).toBe('23:40')
      expect(formatTimeFromIso('2026-10-27T23:40')).toBe('23:40')
    })
  })

  describe('formatShortDate', () => {
    test('dia + mês abreviado em pt-BR sem "de" (array fixo da TechSpec)', () => {
      // Array fixo: jan..ago(8)..out(10)..dez. Outubro → "out"; agosto → "ago".
      expect(formatShortDate('2026-10-16')).toBe('16 out')
      expect(formatShortDate('2026-08-16')).toBe('16 ago')
      expect(formatShortDate('2026-01-01')).toBe('1 jan')
      expect(formatShortDate('2026-12-25')).toBe('25 dez')
    })
  })

  describe('formatDayLabel', () => {
    test('índice 0 é sempre "Hoje"', () => {
      expect(formatDayLabel('2026-10-27', 0)).toBe('Hoje')
      expect(formatDayLabel('2026-01-01', 0)).toBe('Hoje')
    })
    test('weekday curto pt-BR sem ponto e inicial maiúscula', () => {
      // 2026-10-26 é segunda-feira
      expect(formatDayLabel('2026-10-26', 1)).toBe('Seg')
      // 2026-10-27 é terça-feira
      expect(formatDayLabel('2026-10-27', 2)).toBe('Ter')
    })
  })

  describe('formatNumber', () => {
    test('default 0 casas: arredonda e separa milhar em pt-BR', () => {
      expect(formatNumber(1234)).toBe('1.234')
      expect(formatNumber(1234.5)).toBe('1.235')
      expect(formatNumber(-5)).toBe('-5')
    })
    test('vírgula decimal com nº de casas', () => {
      expect(formatNumber(1234.5, 1)).toBe('1.234,5')
      expect(formatNumber(23.56, 1)).toBe('23,6')
    })
  })
})
