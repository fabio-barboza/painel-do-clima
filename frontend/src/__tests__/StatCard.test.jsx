import React from 'react'
import { render } from '@testing-library/react'
import StatCard from '../components/StatCard.jsx'

const BASE_PROPS = {
  icon: 'drop',
  color: '#7cc4ff',
  label: 'Umidade',
  barClassName: 'bar',
}

function renderCard(overrides = {}) {
  return render(<StatCard {...BASE_PROPS} barStyle={{ '--w': '62%' }} value={<>62<small> %</small></>} {...overrides} />)
}

describe('StatCard', () => {
  test('mantém a estrutura de .card.stat com ícone, rótulo, valor e barra', () => {
    const { container } = renderCard()

    const card = container.querySelector('.card.stat')
    expect(card.querySelector('.stat-top .stat-ico svg.ico use')).toHaveAttribute('href', '#i-drop')
    expect(card.querySelector('.stat-top .stat-label')).toHaveTextContent('Umidade')
    expect(card.querySelector('.stat-val')).toBeInTheDocument()
    expect(card.querySelector('.bar > i')).toBeInTheDocument()
  })

  test('aplica a cor inline ao ícone', () => {
    const { container } = renderCard()

    expect(container.querySelector('.stat-ico').style.color).toBe('rgb(124, 196, 255)')
  })

  test('renderiza a marcação do valor com a unidade em <small>, com o espaço dentro do small', () => {
    const { container } = renderCard()

    expect(container.querySelector('.stat-val').innerHTML).toBe('62<small> %</small>')
  })

  test('aplica o id recebido ao valor, como #statFeels', () => {
    const { container } = renderCard({ valueId: 'statFeels' })

    expect(container.querySelector('#statFeels')).toHaveClass('stat-val')
  })

  test('define --w na barra, sem --f quando a barra não é de UV', () => {
    const { container } = renderCard()

    const fill = container.querySelector('.bar > i')
    expect(fill.style.getPropertyValue('--w')).toBe('62%')
    expect(fill.style.getPropertyValue('--f')).toBe('')
    expect(container.querySelector('.bar')).not.toHaveClass('bar-uv')
  })

  test('aplica .bar-uv e --f à barra de UV', () => {
    const { container } = renderCard({
      barClassName: 'bar bar-uv',
      barStyle: { '--w': '50%', '--f': '0.5' },
    })

    const bar = container.querySelector('.bar')
    expect(bar).toHaveClass('bar-uv')
    expect(bar.querySelector('i').style.getPropertyValue('--w')).toBe('50%')
    expect(bar.querySelector('i').style.getPropertyValue('--f')).toBe('0.5')
  })
})
