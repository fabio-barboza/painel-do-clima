import { describe, test, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import viteConfig from '../../vite.config.js'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '../..')
const indexPath = join(here, '../index.css')
const htmlPath = join(root, 'index.html')
const prototipoPath = join(root, '../painel.html')

const css = readFileSync(indexPath, 'utf8')
const html = readFileSync(htmlPath, 'utf8')
const prototipo = readFileSync(prototipoPath, 'utf8')

// Bloco portado = conteúdo entre <style> e </style> do protótipo (bloco 1 de index.css).
const styleStart = prototipo.indexOf('<style>') + '<style>'.length
const styleEnd = prototipo.indexOf('</style>', styleStart)
const esperado = prototipo.slice(styleStart, styleEnd).replace(/^\n/, '')

describe('Foundation — port verbatim do design system', () => {
  test('(a) bloco portado é byte-idêntico ao <style> do painel.html (início de index.css)', () => {
    expect(css.startsWith(esperado)).toBe(true)
  })

  test('(a) bloco portado não vaza os marcadores <style> do protótipo', () => {
    expect(css.startsWith('<style>')).toBe(false)
    expect(css.includes('</style>')).toBe(false)
  })

  test('(b) tokens :root presentes com valores exatos', () => {
    const tokens = {
      '--text': '#eef2ff',
      '--muted': 'rgba(226,235,255,.62)',
      '--faint': 'rgba(226,235,255,.38)',
      '--cyan': '#6ee7ff',
      '--violet': '#a78bfa',
      '--amber': '#ffd76a',
      '--border': 'rgba(255,255,255,.12)',
      '--radius': '24px'
    }
    for (const [name, value] of Object.entries(tokens)) {
      expect(css).toContain(`${name}:${value};`)
    }
  })

  test('(b) os 9 keyframes do protótipo presentes', () => {
    const keyframes = ['skyShift', 'twinkle', 'moonGlow', 'drift', 'shoot', 'ping', 'spin', 'floaty', 'bob']
    for (const kf of keyframes) {
      expect(css).toContain(`@keyframes ${kf}`)
    }
    const total = (css.match(/@keyframes /g) || []).length
    expect(total).toBeGreaterThanOrEqual(9)
  })

  test('(b) os 4 blocos @media presentes (incluindo prefers-reduced-motion global)', () => {
    expect(css).toContain('@media (max-width:920px)')
    expect(css).toContain('@media (max-width:640px)')
    expect(css).toContain('@media (max-width:480px)')
    expect(css).toContain('@media (prefers-reduced-motion:reduce)')
    expect(css).toContain('.reveal{opacity:1;transform:none}')
    expect(css).toContain('.bar i{width:var(--w)}')
    expect(css).toContain('.pt{opacity:1;transform:scale(1)}')
    expect(css).toContain('.area-path{opacity:1}')
  })

  test('(c) index.html: lang pt-BR, título "Painel do Clima", meta description', () => {
    expect(html).toContain('<html lang="pt-BR">')
    expect(html).toContain('<title>Painel do Clima</title>')
    expect(html.toLowerCase()).toContain('<meta name="description"')
  })

  test('(c) index.html: fonte Inter (pesos 300–700) com preconnect', () => {
    expect(html).toContain('family=Inter:wght@300;400;500;600;700&display=swap')
    expect(html).toContain('https://fonts.googleapis.com/css2')
    expect(html).toContain('rel="preconnect" href="https://fonts.googleapis.com"')
    expect(html).toContain('rel="preconnect" href="https://fonts.gstatic.com" crossorigin')
  })

  test('(c) index.html: mantém o favicon /favicon.svg existente', () => {
    expect(html).toContain('href="/favicon.svg"')
  })
})

describe('Foundation — configuração do Vite (proxy Vite e porta)', () => {
  test('server.port === 5173', () => {
    expect(viteConfig.server.port).toBe(5173)
  })

  test("server.proxy['/api'] aponta para o backend em :3000", () => {
    expect(viteConfig.server.proxy['/api'].target).toBe('http://localhost:3000')
  })

  test('proxy /api SEM rewrite (backend mantém o prefixo /api)', () => {
    const proxy = viteConfig.server.proxy['/api']
    expect(proxy.rewrite).toBeUndefined()
  })
})
