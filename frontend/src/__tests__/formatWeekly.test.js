import {
  MISSING_VALUE,
  formatDegrees,
  formatProbability,
  formatRainSummary,
  getCommonScale,
  getRangeBox,
} from '../lib/format.js'

const WEEK_MINIMUMS = [12, 11, 10, 10, 13, 13, 12]
const WEEK_MAXIMUMS = [26, 22, 20, 21, 27, 26, 25]

describe('getCommonScale', () => {
  test('usa a menor mínima e a maior máxima dos dias', () => {
    expect(getCommonScale(WEEK_MINIMUMS, WEEK_MAXIMUMS)).toEqual({ min: 10, max: 27 })
  })

  test('ignora valores nulos', () => {
    expect(getCommonScale([null, 8], [30, null])).toEqual({ min: 8, max: 30 })
  })

  test('retorna null quando não há nenhum valor', () => {
    expect(getCommonScale([null], [null])).toBeNull()
  })
})

describe('getRangeBox', () => {
  const scale = { min: 10, max: 27 }

  test('calcula a posição e a largura na escala comum', () => {
    expect(getRangeBox(12, 26, scale)).toEqual({ left: 12, width: 82 })
    expect(getRangeBox(13, 27, scale)).toEqual({ left: 18, width: 82 })
  })

  test('posiciona no início quando a mínima é a menor da semana', () => {
    expect(getRangeBox(10, 20, scale)).toEqual({ left: 0, width: 59 })
  })

  test('usa 100% quando a menor mínima e a maior máxima são iguais', () => {
    expect(getRangeBox(15, 15, { min: 15, max: 15 })).toEqual({ left: 0, width: 100 })
  })

  test('aplica largura mínima de 4% quando a faixa do dia é quase nula', () => {
    expect(getRangeBox(20, 20, scale)).toEqual({ left: 59, width: 4 })
  })

  test('zera a faixa quando a mínima ou a máxima do dia é nula', () => {
    expect(getRangeBox(null, 20, scale)).toEqual({ left: 0, width: 0 })
    expect(getRangeBox(12, null, scale)).toEqual({ left: 0, width: 0 })
  })

  test('zera a faixa quando não há escala', () => {
    expect(getRangeBox(12, 20, null)).toEqual({ left: 0, width: 0 })
  })
})

describe('formatDegrees', () => {
  test('acrescenta o símbolo de grau a valores arredondados', () => {
    expect(formatDegrees(25.6)).toBe('26°')
  })

  test('exibe o placeholder para nulos', () => {
    expect(formatDegrees(null)).toBe(MISSING_VALUE)
  })
})

describe('formatProbability', () => {
  test('arredonda e acrescenta o símbolo de porcentagem', () => {
    expect(formatProbability(19.6)).toBe('20%')
  })

  test('exibe o placeholder para nulos', () => {
    expect(formatProbability(null)).toBe(MISSING_VALUE)
  })
})

describe('formatRainSummary', () => {
  test('junta probabilidade e volume com separador', () => {
    expect(formatRainSummary(20, 2)).toBe('20% · 2,0 mm')
  })

  test('mostra o placeholder em cada parte nula', () => {
    expect(formatRainSummary(null, 1.25)).toBe('– · 1,3 mm')
    expect(formatRainSummary(40, null)).toBe('40% · –')
  })
})
