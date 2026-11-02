import {
  BAR_SCALES,
  MISSING_VALUE,
  formatDayDate,
  formatDayLabel,
  formatPrecipitation,
  formatTemperature,
  formatUvIndex,
  formatWindSpeed,
  getBarPercentage,
  getCardinalDirection,
  getUvLevel,
  getWeekdayName,
  selectTodayHours,
} from '../lib/format.js'

const SIXTEEN_POINTS_BY_DEGREES = [
  [0, 'N'],
  [22.5, 'NNE'],
  [45, 'NE'],
  [67.5, 'ENE'],
  [90, 'L'],
  [112.5, 'ESE'],
  [135, 'SE'],
  [157.5, 'SSE'],
  [180, 'S'],
  [202.5, 'SSO'],
  [225, 'SO'],
  [247.5, 'OSO'],
  [270, 'O'],
  [292.5, 'ONO'],
  [315, 'NO'],
  [337.5, 'NNO'],
]

afterEach(() => {
  vi.useRealTimers()
})

describe('MISSING_VALUE', () => {
  it('is the en dash placeholder used by painel.html', () => {
    expect(MISSING_VALUE).toBe('–')
  })
})

describe('formatTemperature', () => {
  it('rounds to the nearest integer', () => {
    expect(formatTemperature(25.4)).toBe('25')
    expect(formatTemperature(25.6)).toBe('26')
  })

  it('keeps negative temperatures', () => {
    expect(formatTemperature(-3.6)).toBe('-4')
  })

  it('returns the placeholder for null and undefined', () => {
    expect(formatTemperature(null)).toBe('–')
    expect(formatTemperature(undefined)).toBe('–')
  })
})

describe('formatPrecipitation', () => {
  it('uses a decimal comma and the mm unit', () => {
    expect(formatPrecipitation(0.2)).toBe('0,2 mm')
  })

  it('keeps one decimal for zero', () => {
    expect(formatPrecipitation(0)).toBe('0,0 mm')
  })

  it('returns the placeholder for null', () => {
    expect(formatPrecipitation(null)).toBe('–')
  })
})

describe('formatWindSpeed', () => {
  it('rounds the speed to an integer', () => {
    expect(formatWindSpeed(18.4)).toBe('18')
    expect(formatWindSpeed(18.6)).toBe('19')
  })

  it('returns the placeholder for null', () => {
    expect(formatWindSpeed(null)).toBe('–')
  })
})

describe('getCardinalDirection', () => {
  it.each(SIXTEEN_POINTS_BY_DEGREES)('maps %s degrees to %s', (degrees, point) => {
    expect(getCardinalDirection(degrees)).toBe(point)
  })

  it('wraps 360 degrees back to north', () => {
    expect(getCardinalDirection(360)).toBe('N')
  })

  it('rounds intermediate angles to the nearest point', () => {
    expect(getCardinalDirection(313)).toBe('NO')
    expect(getCardinalDirection(337)).toBe('NNO')
  })

  it('returns the placeholder for null', () => {
    expect(getCardinalDirection(null)).toBe('–')
  })
})

describe('formatUvIndex', () => {
  it('rounds the index before display', () => {
    expect(formatUvIndex(5.65)).toBe('6')
  })

  it('returns the placeholder for null', () => {
    expect(formatUvIndex(null)).toBe('–')
  })
})

describe('getUvLevel', () => {
  it.each([
    [0, 'Baixo'],
    [2, 'Baixo'],
    [2.4, 'Baixo'],
    [3, 'Moderado'],
    [5, 'Moderado'],
    [6, 'Alto'],
    [7, 'Alto'],
    [8, 'Muito alto'],
    [10, 'Muito alto'],
    [11, 'Extremo'],
    [14, 'Extremo'],
  ])('classifies UV %s as %s', (index, level) => {
    expect(getUvLevel(index)).toBe(level)
  })

  it('classifies after rounding, so 2.5 is Moderado', () => {
    expect(getUvLevel(2.5)).toBe('Moderado')
  })

  it('returns the placeholder for null', () => {
    expect(getUvLevel(null)).toBe('–')
  })
})

describe('getBarPercentage', () => {
  it('reproduces the painel.html bar for 20 °C of feels-like temperature', () => {
    expect(getBarPercentage(20, BAR_SCALES.feelsLike)).toBe(55)
  })

  it('reproduces the painel.html bar for 62% humidity', () => {
    expect(getBarPercentage(62, BAR_SCALES.humidity)).toBe(62)
  })

  it('reproduces the painel.html bar for 14 km/h of wind', () => {
    expect(getBarPercentage(14, BAR_SCALES.wind)).toBe(40)
  })

  it('reproduces the painel.html bar for UV 6', () => {
    expect(getBarPercentage(6, BAR_SCALES.uv)).toBe(50)
  })

  it('returns 0 at the lower limit of the scale', () => {
    expect(getBarPercentage(-10, BAR_SCALES.feelsLike)).toBe(0)
  })

  it('returns 100 at the upper limit of the scale', () => {
    expect(getBarPercentage(45, BAR_SCALES.feelsLike)).toBe(100)
  })

  it('clamps values below the scale to 0', () => {
    expect(getBarPercentage(-30, BAR_SCALES.feelsLike)).toBe(0)
  })

  it('clamps values above the scale to 100', () => {
    expect(getBarPercentage(150, BAR_SCALES.humidity)).toBe(100)
  })

  it('returns 0 for null values', () => {
    expect(getBarPercentage(null, BAR_SCALES.wind)).toBe(0)
  })

  it('always returns an integer', () => {
    expect(Number.isInteger(getBarPercentage(33.3, BAR_SCALES.uv))).toBe(true)
  })
})

describe('day names and dates', () => {
  it('reads the weekday from a UTC date, so 2026-08-16 is Dom in any timezone', () => {
    expect(getWeekdayName('2026-08-16')).toBe('Dom')
  })

  it('reads the first day of the month without moving back a day', () => {
    expect(getWeekdayName('2026-11-01')).toBe('Dom')
  })

  it('formats the day and short month in lowercase without a dot', () => {
    expect(formatDayDate('2026-08-16')).toBe('16 ago')
  })

  it('does not pad the day number', () => {
    expect(formatDayDate('2026-03-02')).toBe('2 mar')
  })

  it('labels the day equal to today as Hoje', () => {
    expect(formatDayLabel('2026-08-16', '2026-08-16')).toBe('Hoje')
  })

  it('labels other days with the weekday name', () => {
    expect(formatDayLabel('2026-08-17', '2026-08-16')).toBe('Seg')
  })

  it('reads dates without the system clock', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2030-01-01T00:00:00Z'))
    expect(formatDayDate('2026-08-16')).toBe('16 ago')
    expect(getWeekdayName('2026-08-16')).toBe('Dom')
    vi.useRealTimers()
  })
})

describe('selectTodayHours', () => {
  const hourly = {
    time: [
      '2026-08-15T23:00',
      '2026-08-16T00:00',
      '2026-08-16T01:00',
      '2026-08-16T02:00',
      '2026-08-17T00:00',
    ],
    temperature_2m: [10, 11, 12, 13, 14],
    precipitation: [0, 0.1, 0.2, null, 0.5],
  }

  it('keeps only entries whose time starts with the date of current.time', () => {
    const selected = selectTodayHours(hourly, '2026-08-16T01:30')
    expect(selected.times).toEqual([
      '2026-08-16T00:00',
      '2026-08-16T01:00',
      '2026-08-16T02:00',
    ])
    expect(selected.temps).toEqual([11, 12, 13])
    expect(selected.precip).toEqual([0.1, 0.2, null])
  })

  it('finds the index of the current hour', () => {
    expect(selectTodayHours(hourly, '2026-08-16T01:30').nowIndex).toBe(1)
  })

  it('returns -1 for nowIndex when the current hour is not in the series', () => {
    expect(selectTodayHours(hourly, '2026-08-16T09:00').nowIndex).toBe(-1)
  })

  it('does not depend on the system clock', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2030-06-01T12:00:00Z'))
    const selected = selectTodayHours(hourly, '2026-08-16T01:30')
    expect(selected.nowIndex).toBe(1)
    vi.useRealTimers()
  })
})
