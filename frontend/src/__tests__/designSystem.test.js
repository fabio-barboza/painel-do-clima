import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const PAINEL_HTML_PATH = resolve(__dirname, '../../../painel.html')
const INDEX_HTML_PATH = resolve(__dirname, '../../index.html')
const INDEX_CSS_PATH = resolve(__dirname, '../index.css')

const STYLE_FIRST_LINE = 12
const STYLE_LAST_LINE = 389
const HEAD_FIRST_LINE = 2
const HEAD_LAST_LINE = 10
const SPRITE_FIRST_LINE = 394
const SPRITE_LAST_LINE = 484
const SPRITE_CLOSING_FIRST_LINE = 485
const SPRITE_CLOSING_LAST_LINE = 486
const EXPECTED_SYMBOL_COUNT = 18
const EXPECTED_NEW_SYMBOL_IDS = ['i-fog', 'i-snow']

const readPainelLines = () => readFileSync(PAINEL_HTML_PATH, 'utf8').split('\n')

const sliceLines = (lines, firstLine, lastLine) => lines.slice(firstLine - 1, lastLine).join('\n')

const readIndexHtml = () => readFileSync(INDEX_HTML_PATH, 'utf8')

const collectSymbolIds = (html) => [...html.matchAll(/<symbol id="([^"]+)"/g)].map((match) => match[1])

describe('design system copiado de painel.html', () => {
  test('index.css é a cópia literal das linhas 12 a 389 de painel.html', () => {
    const css = readFileSync(INDEX_CSS_PATH, 'utf8')

    expect(css).toBe(`${sliceLines(readPainelLines(), STYLE_FIRST_LINE, STYLE_LAST_LINE)}\n`)
  })

  test('o sprite contém as linhas 394 a 484 de painel.html sem alterações', () => {
    const html = readIndexHtml()

    expect(html).toContain(sliceLines(readPainelLines(), SPRITE_FIRST_LINE, SPRITE_LAST_LINE))
  })

  test('o sprite termina com as linhas 485 e 486 de painel.html', () => {
    const html = readIndexHtml()

    expect(html).toContain(sliceLines(readPainelLines(), SPRITE_CLOSING_FIRST_LINE, SPRITE_CLOSING_LAST_LINE))
  })

  test('o sprite tem 18 símbolos, com i-fog e i-snow acrescentados', () => {
    const symbolIds = collectSymbolIds(readIndexHtml())

    expect(symbolIds).toHaveLength(EXPECTED_SYMBOL_COUNT)
    expect(symbolIds.slice(-EXPECTED_NEW_SYMBOL_IDS.length)).toEqual(EXPECTED_NEW_SYMBOL_IDS)
  })

  test('o <head> de index.html contém as linhas 2 a 10 de painel.html', () => {
    const html = readIndexHtml()

    expect(html).toContain(sliceLines(readPainelLines(), HEAD_FIRST_LINE, HEAD_LAST_LINE))
  })

  test('index.html declara lang pt-BR e carrega a fonte Inter com os pesos 300 a 700', () => {
    const html = readIndexHtml()

    expect(html).toContain('<html lang="pt-BR">')
    expect(html).toContain('family=Inter:wght@300;400;500;600;700&display=swap')
  })

  test('o sprite fica depois de <body> e antes de #root', () => {
    const html = readIndexHtml()

    expect(html.indexOf('<body>')).toBeLessThan(html.indexOf('<svg width="0"'))
    expect(html.indexOf('<svg width="0"')).toBeLessThan(html.indexOf('<div id="root">'))
  })
})
