import React from 'react'
import { render } from '@testing-library/react'
import WeatherIcon from '../components/WeatherIcon.jsx'

describe('WeatherIcon', () => {
  test('i-cloud-sun monta sol e nuvem no bloco sem a classe solo', () => {
    const { container } = render(<WeatherIcon icon="i-cloud-sun" />)

    const block = container.querySelector('.big-icon')
    expect(block).toHaveAttribute('aria-hidden', 'true')
    expect(block).not.toHaveClass('solo')
    expect(block.querySelector('.bi-sun .rotor')).toBeInTheDocument()
    expect(block.querySelector('.bi-cloud use')).toHaveAttribute('href', '#i-cloud')
  })

  test('i-sun usa apenas o sol dentro de big-icon solo', () => {
    const { container } = render(<WeatherIcon icon="i-sun" />)

    const block = container.querySelector('.big-icon.solo')
    expect(block.querySelector('.bi-sun')).toBeInTheDocument()
    expect(block.querySelector('.bi-cloud')).not.toBeInTheDocument()
  })

  test.each(['i-cloud', 'i-fog', 'i-rain', 'i-snow', 'i-storm'])(
    '%s usa apenas a nuvem com o símbolo do grupo em big-icon solo',
    (icon) => {
      const { container } = render(<WeatherIcon icon={icon} />)

      const block = container.querySelector('.big-icon.solo')
      expect(block.querySelector('.bi-sun')).not.toBeInTheDocument()
      expect(block.querySelector('.bi-cloud use')).toHaveAttribute('href', `#${icon}`)
    },
  )
})
