import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import viteConfig from '../../vite.config.js'

const MAIN_JSX_PATH = resolve(__dirname, '../main.jsx')
const ADDITIONS_CSS_PATH = resolve(__dirname, '../additions.css')

const EXPECTED_DEV_PORT = 5173
const EXPECTED_PREVIEW_PORT = 4173
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const INDEX_CSS_IMPORT = "import './index.css'"
const ADDITIONS_CSS_IMPORT = "import './additions.css'"
const CLOSED_LIST_SELECTORS = [
  '.bar-uv i',
  '.d-range',
  '.d-range i',
  '.precip-bar',
  '.precip-bar.show',
  '.chart-legend',
  '.dotline.rain',
  '.notice',
  '.notice p',
  '.btn.is-busy',
  '.btn.is-busy .ico',
  '.skel',
  '.temp.is-skel',
  '.chart-skel',
  '.big-icon.solo .bi-sun',
  '.big-icon.solo .bi-cloud',
  'footer a',
  '.sr-only',
  '.sky-layer',
  '.sky-layer.is-active',
  '.sky-layer.sky-cloudy',
  '.sky-layer.sky-rain',
  '#stars,.moon',
  '.sky[data-sky="cloudy"] #stars',
  '.sky[data-sky="cloudy"] .moon',
  '.sky[data-sky="cloudy"] .bg-cloud',
  '.sky[data-sky="rain"] #stars',
  '.sky[data-sky="rain"] .moon',
]

const readMainJsx = () => readFileSync(MAIN_JSX_PATH, 'utf8')

const readAdditionsCss = () => readFileSync(ADDITIONS_CSS_PATH, 'utf8')

describe('integração dos estilos no ponto de entrada', () => {
  test('main.jsx importa index.css antes de additions.css', () => {
    const source = readMainJsx()
    const indexCssPosition = source.indexOf(INDEX_CSS_IMPORT)
    const additionsCssPosition = source.indexOf(ADDITIONS_CSS_IMPORT)

    expect(indexCssPosition).toBeGreaterThan(-1)
    expect(additionsCssPosition).toBeGreaterThan(indexCssPosition)
  })

  test('additions.css contém as regras da lista fechada', () => {
    const css = readAdditionsCss()

    CLOSED_LIST_SELECTORS.forEach((selector) => {
      expect(css).toContain(selector)
    })
  })

  test('additions.css usa somente a cor nova autorizada do gradiente do UV', () => {
    const css = readAdditionsCss()
    const hexColors = css.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []
    const allowedColors = [
      '#4ade80',
      '#ffd76a',
      '#ff8a5c',
      '#ef4444',
      '#7cc4ff',
      '#090b11',
      '#0f121a',
      '#181c28',
      '#04070f',
      '#071019',
      '#0a1826',
    ]

    hexColors.forEach((color) => {
      expect(allowedColors).toContain(color.toLowerCase())
    })
  })

  test('os mocks de setup.js estão disponíveis', () => {
    expect(typeof window.IntersectionObserver).toBe('function')
    expect(typeof window.matchMedia).toBe('function')
    expect(window.matchMedia(REDUCED_MOTION_QUERY).matches).toBe(false)
    expect(typeof SVGElement.prototype.getTotalLength).toBe('function')
  })

  test('vite.config.js fixa as portas de desenvolvimento e de preview', () => {
    expect(viteConfig.server.port).toBe(EXPECTED_DEV_PORT)
    expect(viteConfig.preview.port).toBe(EXPECTED_PREVIEW_PORT)
  })
})
