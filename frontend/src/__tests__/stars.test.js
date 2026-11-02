import { STARS, STAR_COUNT, createStars } from '../lib/stars.js'

const PERCENT_LIMIT = 100
const SIZE_MIN_PX = 0.8
const SIZE_MAX_PX = 2.6
const OPACITY_MIN = 0.4
const OPACITY_MAX = 1
const DURATION_MIN_S = 2
const DURATION_MAX_S = 5
const DELAY_MAX_S = 4

const PERCENT_PATTERN = /^\d+\.\d{2}%$/
const PIXEL_PATTERN = /^\d+\.\dpx$/
const SECONDS_PATTERN = /^\d+\.\ds$/

const parseNumber = (value) => Number.parseFloat(value)

const constantRandom = (value) => () => value

describe('stars', () => {
  test('gera 140 estrelas', () => {
    expect(STAR_COUNT).toBe(140)
    expect(STARS).toHaveLength(140)
  })

  test('mantém os valores dentro das faixas de painel.html', () => {
    STARS.forEach((star) => {
      expect(parseNumber(star.left)).toBeGreaterThanOrEqual(0)
      expect(parseNumber(star.left)).toBeLessThanOrEqual(PERCENT_LIMIT)
      expect(parseNumber(star.top)).toBeGreaterThanOrEqual(0)
      expect(parseNumber(star.top)).toBeLessThanOrEqual(PERCENT_LIMIT)
      expect(parseNumber(star.size)).toBeGreaterThanOrEqual(SIZE_MIN_PX)
      expect(parseNumber(star.size)).toBeLessThanOrEqual(SIZE_MAX_PX)
      expect(parseNumber(star.opacity)).toBeGreaterThanOrEqual(OPACITY_MIN)
      expect(parseNumber(star.opacity)).toBeLessThanOrEqual(OPACITY_MAX)
      expect(parseNumber(star.duration)).toBeGreaterThanOrEqual(DURATION_MIN_S)
      expect(parseNumber(star.duration)).toBeLessThanOrEqual(DURATION_MAX_S)
      expect(parseNumber(star.delay)).toBeGreaterThanOrEqual(0)
      expect(parseNumber(star.delay)).toBeLessThanOrEqual(DELAY_MAX_S)
    })
  })

  test('formata cada valor com unidade CSS completa', () => {
    const [firstStar] = STARS

    expect(firstStar.left).toMatch(PERCENT_PATTERN)
    expect(firstStar.top).toMatch(PERCENT_PATTERN)
    expect(firstStar.size).toMatch(PIXEL_PATTERN)
    expect(firstStar.duration).toMatch(SECONDS_PATTERN)
    expect(firstStar.delay).toMatch(SECONDS_PATTERN)
  })

  test('gera valores mínimos com a fonte de aleatoriedade injetada', () => {
    const [star] = createStars(constantRandom(0))

    expect(star).toEqual({
      id: 0,
      left: '0.00%',
      top: '0.00%',
      size: '0.8px',
      opacity: '0.40',
      duration: '2.0s',
      delay: '0.0s',
    })
  })
})
