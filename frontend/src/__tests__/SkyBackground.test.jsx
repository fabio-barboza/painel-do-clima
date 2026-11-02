import React from 'react'
import { render } from '@testing-library/react'
import SkyBackground from '../components/SkyBackground.jsx'

const STAR_TOTAL = 140
const CLOUD_STYLES = [
  { top: '14%', width: '420px', height: '110px', animationDuration: '100s', animationDelay: '-20s' },
  { top: '42%', width: '540px', height: '130px', animationDuration: '150s', animationDelay: '-80s' },
  { top: '68%', width: '380px', height: '100px', animationDuration: '120s', animationDelay: '-45s' },
]
const SHOOTING_STAR_TOP = '12%'

const renderSky = () => render(<SkyBackground />)

describe('SkyBackground', () => {
  test('renderiza o wrapper de referência', () => {
    const { container } = renderSky()

    expect(container.querySelector('.sky')).toHaveAttribute('data-sky', 'reference')
  })

  test('renderiza #stars com 140 estrelas escondidas de tecnologias assistivas', () => {
    const { container } = renderSky()
    const stars = container.querySelector('#stars')

    expect(stars).toHaveAttribute('aria-hidden', 'true')
    expect(stars.querySelectorAll('i')).toHaveLength(STAR_TOTAL)
  })

  test('aplica as custom properties de animação em cada estrela', () => {
    const { container } = renderSky()
    const [firstStar] = container.querySelectorAll('#stars i')

    expect(firstStar.style.getPropertyValue('--o')).toMatch(/^\d\.\d{2}$/)
    expect(firstStar.style.getPropertyValue('--td')).toMatch(/^\d\.\ds$/)
    expect(firstStar.style.getPropertyValue('--tdel')).toMatch(/^\d\.\ds$/)
  })

  test('renderiza a lua decorativa', () => {
    const { container } = renderSky()

    expect(container.querySelectorAll('.moon')).toHaveLength(1)
    expect(container.querySelector('.moon')).toHaveAttribute('aria-hidden', 'true')
  })

  test('renderiza três nuvens com os estilos inline de painel.html', () => {
    const { container } = renderSky()
    const clouds = container.querySelectorAll('.bg-cloud')

    expect(clouds).toHaveLength(3)
    clouds.forEach((cloud, index) => {
      const expected = CLOUD_STYLES[index]

      expect(cloud).toHaveAttribute('aria-hidden', 'true')
      expect(cloud.style.top).toBe(expected.top)
      expect(cloud.style.width).toBe(expected.width)
      expect(cloud.style.height).toBe(expected.height)
      expect(cloud.style.animationDuration).toBe(expected.animationDuration)
      expect(cloud.style.animationDelay).toBe(expected.animationDelay)
    })
  })

  test('renderiza as duas estrelas cadentes com seus estilos', () => {
    const { container } = renderSky()
    const shootingStars = container.querySelectorAll('.shoot')

    expect(shootingStars).toHaveLength(2)
    expect(shootingStars[0].style.top).toBe(SHOOTING_STAR_TOP)
    expect(shootingStars[1]).toHaveClass('shoot2')
    shootingStars.forEach((shootingStar) => {
      expect(shootingStar).toHaveAttribute('aria-hidden', 'true')
    })
  })

  test('mantém as posições das estrelas em novos renders', () => {
    const { container, rerender } = renderSky()
    const readStarStyles = () =>
      [...container.querySelectorAll('#stars i')].map((star) => star.getAttribute('style'))
    const firstRenderStyles = readStarStyles()

    rerender(<SkyBackground />)

    expect(readStarStyles()).toEqual(firstRenderStyles)
  })

  test('usa reference quando nenhuma variante é informada', () => {
    const { container } = renderSky()

    expect(container.querySelector('.sky')).toHaveAttribute('data-sky', 'reference')
  })

  test('aplica a variante recebida por prop em data-sky', () => {
    const { container, rerender } = renderSky()

    rerender(<SkyBackground sky="cloudy" />)
    expect(container.querySelector('.sky')).toHaveAttribute('data-sky', 'cloudy')

    rerender(<SkyBackground sky="rain" />)
    expect(container.querySelector('.sky')).toHaveAttribute('data-sky', 'rain')
  })

  test('renderiza as camadas sky-cloudy e sky-rain antes de #stars', () => {
    const { container } = renderSky()
    const [cloudyLayer, rainLayer, stars] = [...container.querySelector('.sky').children].slice(0, 3)

    expect(cloudyLayer).toHaveClass('sky-layer', 'sky-cloudy')
    expect(rainLayer).toHaveClass('sky-layer', 'sky-rain')
    expect(stars).toBe(container.querySelector('#stars'))
    expect(cloudyLayer).toHaveAttribute('aria-hidden', 'true')
    expect(rainLayer).toHaveAttribute('aria-hidden', 'true')
  })

  test('mantém as camadas inativas na variante reference', () => {
    const { container } = renderSky()

    expect(container.querySelector('.sky-cloudy')).not.toHaveClass('is-active')
    expect(container.querySelector('.sky-rain')).not.toHaveClass('is-active')
  })

  test('ativa somente a camada da variante recebida', () => {
    const { container, rerender } = renderSky()

    rerender(<SkyBackground sky="cloudy" />)
    expect(container.querySelector('.sky-cloudy')).toHaveClass('is-active')
    expect(container.querySelector('.sky-rain')).not.toHaveClass('is-active')

    rerender(<SkyBackground sky="rain" />)
    expect(container.querySelector('.sky-cloudy')).not.toHaveClass('is-active')
    expect(container.querySelector('.sky-rain')).toHaveClass('is-active')
  })

  test('preserva a decoração de referência em todas as variantes', () => {
    const { container, rerender } = renderSky()

    ;['cloudy', 'rain'].forEach((sky) => {
      rerender(<SkyBackground sky={sky} />)

      expect(container.querySelectorAll('#stars i')).toHaveLength(STAR_TOTAL)
      expect(container.querySelectorAll('.moon')).toHaveLength(1)
      expect(container.querySelectorAll('.bg-cloud')).toHaveLength(3)
      expect(container.querySelectorAll('.shoot')).toHaveLength(2)
    })
  })
})
