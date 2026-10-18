import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf-8')

describe('frontend/index.html', () => {
  it('declara o idioma pt-BR no elemento html', () => {
    expect(html).toMatch(/<html[^>]*lang="pt-BR"/)
  })

  it('possui título da aplicação significativo', () => {
    const match = html.match(/<title>([\s\S]*?)<\/title>/)
    expect(match).not.toBeNull()
    const title = match[1].trim()
    expect(title.length).toBeGreaterThan(0)
    expect(title).not.toBe('frontend')
  })

  it('possui meta description não vazia', () => {
    const match = html.match(/<meta\s+name="description"\s+content="([^"]*)"/)
    expect(match).not.toBeNull()
    expect(match[1].trim().length).toBeGreaterThan(10)
  })

  it('mantém viewport responsivo e o container da aplicação', () => {
    expect(html).toMatch(/<meta\s+name="viewport"\s+content="width=device-width, initial-scale=1\.0"/)
    expect(html).toContain('<div id="root"></div>')
  })
})
