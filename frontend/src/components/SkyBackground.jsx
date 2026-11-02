import React from 'react'
import { STARS } from '../lib/stars.js'

const CLOUD_LAYERS = [
  { top: '14%', width: '420px', height: '110px', duration: '100s', delay: '-20s' },
  { top: '42%', width: '540px', height: '130px', duration: '150s', delay: '-80s' },
  { top: '68%', width: '380px', height: '100px', duration: '120s', delay: '-45s' },
]

const SHOOTING_STAR_TOP = '12%'

const REFERENCE_SKY = 'reference'

const SKY_LAYERS = [
  { sky: 'cloudy', className: 'sky-layer sky-cloudy' },
  { sky: 'rain', className: 'sky-layer sky-rain' },
]

const renderSkyLayer = (layer, activeSky) => (
  <div
    key={layer.sky}
    className={layer.sky === activeSky ? `${layer.className} is-active` : layer.className}
    aria-hidden="true"
  />
)

const renderStar = (star) => (
  <i
    key={star.id}
    style={{
      left: star.left,
      top: star.top,
      width: star.size,
      height: star.size,
      '--o': star.opacity,
      '--td': star.duration,
      '--tdel': star.delay,
    }}
  />
)

const renderCloud = (cloud) => (
  <div
    key={cloud.top}
    className="bg-cloud"
    style={{
      top: cloud.top,
      width: cloud.width,
      height: cloud.height,
      animationDuration: cloud.duration,
      animationDelay: cloud.delay,
    }}
    aria-hidden="true"
  />
)

function SkyBackground({ sky = REFERENCE_SKY }) {
  return (
    <div className="sky" data-sky={sky}>
      {SKY_LAYERS.map((layer) => renderSkyLayer(layer, sky))}
      <div id="stars" aria-hidden="true">
        {STARS.map(renderStar)}
      </div>
      <div className="moon" aria-hidden="true" />
      {CLOUD_LAYERS.map(renderCloud)}
      <div className="shoot" style={{ top: SHOOTING_STAR_TOP }} aria-hidden="true" />
      <div className="shoot shoot2" aria-hidden="true" />
    </div>
  )
}

export default SkyBackground
