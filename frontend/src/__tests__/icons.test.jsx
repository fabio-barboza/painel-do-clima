import { describe, test, expect, beforeEach } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'
import IconSprite from '../components/IconSprite.jsx'
import Icon from '../components/Icon.jsx'

const ALL_ICON_NAMES = [
  'sun', 'sun-rays', 'cloud', 'cloud-sun', 'rain', 'storm',
  'drop', 'wind', 'thermo', 'uv', 'pin', 'up', 'down',
  'brand', 'search', 'gps'
]

describe('Icon', () => {
  test('renderiza <use href="#i-{name}"> com prefixo i- adicionado', () => {
    const { container } = render(<Icon name="sun" />)
    const use = container.querySelector('use')
    expect(use).toBeTruthy()
    expect(use.getAttribute('href')).toBe('#i-sun')
  })

  test('svg tem classe ico e aria-hidden="true"', () => {
    const { container } = render(<Icon name="cloud" />)
    const svg = container.querySelector('svg.ico')
    expect(svg).toBeTruthy()
    expect(svg.getAttribute('aria-hidden')).toBe('true')
  })

  test('não adiciona o prefixo i- quando o nome já vem com ele', () => {
    const { container } = render(<Icon name="i-rain" />)
    expect(container.querySelector('use').getAttribute('href')).toBe('#i-i-rain')
  })
})

describe('IconSprite — 16 símbolos', () => {
  let container

  beforeEach(() => {
    ;({ container } = render(<IconSprite />))
  })

  test('renderiza os 16 símbolos com os ids exatos do protótipo', () => {
    for (const id of ALL_ICON_NAMES) {
      expect(container.querySelector(`#i-${id}`)).not.toBeNull()
    }
  })

  test('i-sun: viewBox e um path verbatim do protótipo', () => {
    const sun = container.querySelector('#i-sun')
    expect(sun.getAttribute('viewBox')).toBe('0 0 24 24')
    expect(
      sun.querySelector('circle').getAttribute('r')
    ).toBe('4.6')
    expect(
      sun.querySelector('line[y1="1.8"]').getAttribute('y2')
    ).toBe('4.2')
  })

  test('i-cloud-sun preserva a cor #ffd76a e o circle do sol', () => {
    const cloudSun = container.querySelector('#i-cloud-sun')
    expect(cloudSun.getAttribute('viewBox')).toBe('0 0 24 24')
    expect(
      cloudSun.querySelector('circle').getAttribute('fill')
    ).toBe('#ffd76a')
  })

  test('nenhum id duplicado no sprite', () => {
    const ids = [...container.querySelectorAll('symbol')].map(s => s.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toHaveLength(16)
  })
})

describe('IconSprite + Icons — integração (nenhuma referência quebrada)', () => {
  test('todo <use> resolve para um símbolo existente no sprite', () => {
    render(
      <>
        <IconSprite />
        {ALL_ICON_NAMES.map(name => <Icon key={name} name={name} />)}
      </>
    )

    const symbolIds = new Set(
      [...document.querySelectorAll('symbol')].map(s => s.id)
    )
    const uses = [...document.querySelectorAll('use')]

    expect(uses).toHaveLength(ALL_ICON_NAMES.length)
    for (const use of uses) {
      const href = use.getAttribute('href')
      expect(symbolIds.has(href.replace('#', ''))).toBe(true)
    }
  })

  test('renderiza todos os 16 ícones sem lançar erro', () => {
    render(
      <>
        <IconSprite />
        {ALL_ICON_NAMES.map(name => <Icon key={name} name={name} />)}
      </>
    )
    expect(document.querySelectorAll('svg.ico')).toHaveLength(ALL_ICON_NAMES.length)
  })
})
