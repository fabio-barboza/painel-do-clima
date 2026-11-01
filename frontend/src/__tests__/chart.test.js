import { describe, test, expect } from 'vitest'
import { computeScales, smoothPath, rainBarHeights } from '../lib/chart.js'

const PLOT_H = 232

function numericY(path) {
  return String(path).match(/-?\d+\.?\d*/g).map(Number).filter((_, i) => i % 2 === 1)
}

describe('chart.js', () => {
  describe('computeScales', () => {
    const temps = [18, 19, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 20, 19, 18, 17, 19, 22, 25, 27, 28, 26, 23]
    const scales = computeScales(temps)

    test('tMin/tMax múltiplos de 4', () => {
      expect(scales.tMin % 4).toBe(0)
      expect(scales.tMax % 4).toBe(0)
      expect(scales.step).toBe(4)
    })

    test('geometria X: X(0)=44 e X(23)=744', () => {
      expect(scales.X(0)).toBe(44)
      expect(scales.X(23)).toBe(744)
    })

    test('Y no domínio do plot (26..258)', () => {
      expect(scales.Y(scales.tMax)).toBe(26)
      expect(scales.Y(scales.tMin)).toBe(26 + PLOT_H)
      const mid = scales.Y((scales.tMin + scales.tMax) / 2)
      expect(mid).toBeGreaterThan(26)
      expect(mid).toBeLessThan(26 + PLOT_H)
    })
  })

  describe('smoothPath', () => {
    const pts = Array.from({ length: 24 }, (_, i) => [44 + i * 30.4, 100 + Math.sin(i) * 20])
    const path = smoothPath(pts)

    test('1 M + 23 curvas C para 24 pontos', () => {
      expect(path.startsWith('M ')).toBe(true)
      expect(path.split(' C ').length - 1).toBe(23)
    })

    test('idempotente e colinear: pontos na mesma linha geram caminho reto', () => {
      const colineares = Array.from({ length: 24 }, (_, i) => [44 + i * 30, 100])
      const a = smoothPath(colineares)
      const b = smoothPath(colineares)
      expect(a).toBe(b)
      expect(numericY(a).every(y => y === 100)).toBe(true)
    })

    test('toFixed(1) em cada coordenada (precisão de 1 casa)', () => {
      const nums = String(path).match(/-?\d+\.?\d*/g)
      expect(nums.length).toBeGreaterThan(0)
      for (const n of nums) {
        expect(n).toMatch(/^-?\d+\.\d$/)
      }
    })
  })

  describe('rainBarHeights', () => {
    test('p=0 → sem barra (0)', () => {
      expect(rainBarHeights([0, 0, 0])).toEqual([0, 0, 0])
    })

    test('p>0 → altura ≥ 2 px', () => {
      const alturas = rainBarHeights([1, 2, 5])
      for (const altura of alturas) {
        expect(altura).toBeGreaterThanOrEqual(2)
      }
    })

    test('teto 28% do plot', () => {
      const grande = rainBarHeights([500])
      expect(grande[0]).toBeLessThanOrEqual(0.28 * PLOT_H)
    })

    test('piso de pMax = 1 mm (chuva entre 0 e 1 mm)', () => {
      // pMax = max(0.5, 1) * 1.25 = 1.25
      const altura = rainBarHeights([0.5])[0]
      expect(altura).toBeCloseTo((0.5 / 1.25) * PLOT_H * 0.28, 6)
    })

    test('mista: zeros e valores', () => {
      expect(rainBarHeights([0, 3, 0, 10])).toEqual([0, expect.any(Number), 0, expect.any(Number)])
    })
  })
})
