import React, { useMemo } from 'react'

const STAR_COUNT = 140

const clouds = [
  { top: '14%', width: '420px', height: '110px', duration: '100s', delay: '-20s' },
  { top: '42%', width: '540px', height: '130px', duration: '150s', delay: '-80s' },
  { top: '68%', width: '380px', height: '100px', duration: '120s', delay: '-45s' }
]

function buildStars() {
  return Array.from({ length: STAR_COUNT }, (_, i) => {
    const size = (Math.random() * 1.8 + 0.8).toFixed(1)
    return {
      key: i,
      style: {
        left: (Math.random() * 100).toFixed(2) + '%',
        top: (Math.random() * 100).toFixed(2) + '%',
        width: size + 'px',
        height: size + 'px',
        '--o': (Math.random() * 0.6 + 0.4).toFixed(2),
        '--td': (Math.random() * 3 + 2).toFixed(1) + 's',
        '--tdel': (Math.random() * 4).toFixed(1) + 's'
      }
    }
  })
}

function SkyBackground({ tint = 'clear' }) {
  const stars = useMemo(() => buildStars(), [])

  return (
    <div data-tint={tint}>
      <div id="stars" aria-hidden="true">
        {stars.map(star => (
          <i key={star.key} style={star.style} />
        ))}
      </div>
      <div className="moon" aria-hidden="true" />
      {clouds.map((cloud, i) => (
        <div
          key={i}
          className="bg-cloud"
          aria-hidden="true"
          style={{
            top: cloud.top,
            width: cloud.width,
            height: cloud.height,
            animationDuration: cloud.duration,
            animationDelay: cloud.delay
          }}
        />
      ))}
      <div className="shoot" style={{ top: '12%' }} aria-hidden="true" />
      <div className="shoot shoot2" aria-hidden="true" />
      <div className="tint-layer" data-tint="cloudy" aria-hidden="true" />
      <div className="tint-layer" data-tint="rain" aria-hidden="true" />
    </div>
  )
}

export default SkyBackground
