export const STAR_COUNT = 140

const SIZE_MIN = 0.8
const SIZE_RANGE = 1.8
const OPACITY_MIN = 0.4
const OPACITY_RANGE = 0.6
const DURATION_MIN = 2
const DURATION_RANGE = 3
const DELAY_RANGE = 4
const PERCENT_RANGE = 100

const scaleValue = (random, min, range) => min + random() * range

const formatFixed = (value, digits) => value.toFixed(digits)

const createStar = (random, id) => {
  const size = formatFixed(scaleValue(random, SIZE_MIN, SIZE_RANGE), 1)

  return {
    id,
    left: `${formatFixed(random() * PERCENT_RANGE, 2)}%`,
    top: `${formatFixed(random() * PERCENT_RANGE, 2)}%`,
    size: `${size}px`,
    opacity: formatFixed(scaleValue(random, OPACITY_MIN, OPACITY_RANGE), 2),
    duration: `${formatFixed(scaleValue(random, DURATION_MIN, DURATION_RANGE), 1)}s`,
    delay: `${formatFixed(random() * DELAY_RANGE, 1)}s`,
  }
}

export const createStars = (random = Math.random) =>
  Array.from({ length: STAR_COUNT }, (_, id) => createStar(random, id))

export const STARS = createStars()
