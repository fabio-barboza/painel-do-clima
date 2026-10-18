import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf-8')

const colorTokens = [
  '--color-bg',
  '--color-surface',
  '--color-surface-alt',
  '--color-text',
  '--color-text-muted',
  '--color-primary',
  '--color-on-primary',
  '--color-accent',
  '--color-border',
  '--color-border-strong',
  '--color-focus',
  '--color-skeleton',
]

const typographyTokens = [
  '--font-family',
  '--font-size-sm',
  '--font-size-base',
  '--font-size-md',
  '--font-size-lg',
  '--font-size-xl',
  '--font-size-display',
  '--font-weight-regular',
  '--font-weight-medium',
  '--font-weight-bold',
  '--line-height-tight',
  '--line-height-base',
]

const spacingTokens = ['--space-1', '--space-2', '--space-3', '--space-4', '--space-5', '--space-6', '--space-7']

const radiusTokens = ['--radius-sm', '--radius-md', '--radius-lg', '--radius-full']

const shadowTokens = ['--shadow-sm', '--shadow-md', '--shadow-lg']

function themeBlock(theme) {
  const re = new RegExp(`\\[data-theme='${theme}'\\]\\s*\\{([\\s\\S]*?)\\n\\}`)
  const match = css.match(re)
  expect(match, `bloco do tema ${theme} não encontrado`).not.toBeNull()
  return match[1]
}

function neutralRootBlock() {
  const re = /:root\s*\{([\s\S]*?)\n\}/
  const match = css.match(re)
  expect(match, 'bloco :root neutro não encontrado').not.toBeNull()
  return match[1]
}

describe('design tokens em src/index.css', () => {
  it('aplica o tema base clear na raiz (:root)', () => {
    expect(css).toMatch(/:root,\s*\[data-theme='clear'\]\s*\{/)
  })

  it.each(colorTokens)('define o token de cor %s no tema clear', (token) => {
    expect(themeBlock('clear')).toContain(`${token}:`)
  })

  it.each(colorTokens)('define o token de cor %s no tema cloudy', (token) => {
    expect(themeBlock('cloudy')).toContain(`${token}:`)
  })

  it.each(colorTokens)('define o token de cor %s no tema rain', (token) => {
    expect(themeBlock('rain')).toContain(`${token}:`)
  })

  it('tema cloudy altera a paleta da raiz', () => {
    const block = themeBlock('cloudy')
    expect(block).toMatch(/--color-bg:\s*#e6e9ee/)
    expect(block).toMatch(/--color-text:\s*#1f2937/)
    expect(block).toMatch(/--color-primary:\s*#44586e/)
  })

  it('tema rain altera a paleta da raiz', () => {
    const block = themeBlock('rain')
    expect(block).toMatch(/--color-bg:\s*#0f1b2d/)
    expect(block).toMatch(/--color-text:\s*#e6eef7/)
    expect(block).toMatch(/--color-primary:\s*#4da3ff/)
  })

  it.each(typographyTokens)('define o token tipográfico %s', (token) => {
    expect(neutralRootBlock()).toContain(`${token}:`)
  })

  it.each(spacingTokens)('define o token de espaçamento %s', (token) => {
    expect(neutralRootBlock()).toContain(`${token}:`)
  })

  it.each(radiusTokens)('define o token de raio %s', (token) => {
    expect(neutralRootBlock()).toContain(`${token}:`)
  })

  it.each(shadowTokens)('define o token de sombra %s no tema clear', (token) => {
    expect(themeBlock('clear')).toContain(`${token}:`)
  })

  it('possui estilos base de skeleton com animação de pulso', () => {
    expect(css).toMatch(/\.skeleton\s*\{[\s\S]*?animation:\s*skeleton-pulse/)
    expect(css).toContain('@keyframes skeleton-pulse')
  })

  it('respeita prefers-reduced-motion no skeleton', () => {
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/)
  })

  it('possui fundação responsiva com breakpoints mobile, tablet e web', () => {
    expect(css).toMatch(/@media\s*\(min-width:\s*640px\)/)
    expect(css).toMatch(/@media\s*\(min-width:\s*1024px\)/)
    expect(css).toMatch(/\.panel-grid\s*\{[\s\S]*?grid-template-columns:\s*1fr/)
  })

  it('define foco visível para elementos interativos', () => {
    expect(css).toMatch(/:focus-visible\s*\{[\s\S]*?outline:\s*3px solid var\(--color-focus\)/)
  })
})
