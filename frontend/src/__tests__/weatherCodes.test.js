import { getWeatherInfo } from '../lib/weatherCodes.js'

const UNKNOWN_CODE_COLOR = '#c9d6f2'

const WMO_CODE_TABLE = [
  [0, 'Céu limpo', 'i-sun', '#ffd76a', 'reference'],
  [1, 'Predominantemente limpo', 'i-sun', '#ffd76a', 'reference'],
  [2, 'Parcialmente nublado', 'i-cloud-sun', '#ffd76a', 'reference'],
  [3, 'Encoberto', 'i-cloud', '#c9d6f2', 'cloudy'],
  [45, 'Neblina', 'i-fog', '#c9d6f2', 'cloudy'],
  [48, 'Neblina com geada', 'i-fog', '#c9d6f2', 'cloudy'],
  [51, 'Garoa leve', 'i-rain', '#7cc4ff', 'rain'],
  [53, 'Garoa moderada', 'i-rain', '#7cc4ff', 'rain'],
  [55, 'Garoa intensa', 'i-rain', '#7cc4ff', 'rain'],
  [56, 'Garoa congelante leve', 'i-rain', '#7cc4ff', 'rain'],
  [57, 'Garoa congelante intensa', 'i-rain', '#7cc4ff', 'rain'],
  [61, 'Chuva fraca', 'i-rain', '#7cc4ff', 'rain'],
  [63, 'Chuva moderada', 'i-rain', '#7cc4ff', 'rain'],
  [65, 'Chuva forte', 'i-rain', '#7cc4ff', 'rain'],
  [66, 'Chuva congelante fraca', 'i-rain', '#7cc4ff', 'rain'],
  [67, 'Chuva congelante forte', 'i-rain', '#7cc4ff', 'rain'],
  [71, 'Neve fraca', 'i-snow', '#c9d6f2', 'rain'],
  [73, 'Neve moderada', 'i-snow', '#c9d6f2', 'rain'],
  [75, 'Neve forte', 'i-snow', '#c9d6f2', 'rain'],
  [77, 'Grãos de neve', 'i-snow', '#c9d6f2', 'rain'],
  [80, 'Pancadas de chuva fracas', 'i-rain', '#7cc4ff', 'rain'],
  [81, 'Pancadas de chuva moderadas', 'i-rain', '#7cc4ff', 'rain'],
  [82, 'Pancadas de chuva violentas', 'i-rain', '#7cc4ff', 'rain'],
  [85, 'Pancadas de neve fracas', 'i-snow', '#c9d6f2', 'rain'],
  [86, 'Pancadas de neve fortes', 'i-snow', '#c9d6f2', 'rain'],
  [95, 'Trovoada', 'i-storm', '#c9b8ff', 'rain'],
  [96, 'Trovoada com granizo fraco', 'i-storm', '#c9b8ff', 'rain'],
  [97, 'Trovoada forte', 'i-storm', '#c9b8ff', 'rain'],
  [99, 'Trovoada com granizo forte', 'i-storm', '#c9b8ff', 'rain'],
]

describe('getWeatherInfo', () => {
  it.each(WMO_CODE_TABLE)(
    'returns label, icon, color and sky for WMO code %i',
    (code, label, icon, color, sky) => {
      expect(getWeatherInfo(code)).toEqual({ label, icon, sky, color })
    },
  )

  it('covers every WMO code listed in the table', () => {
    const codes = WMO_CODE_TABLE.map(([code]) => code)
    expect(new Set(codes).size).toBe(codes.length)
    codes.forEach((code) => {
      expect(getWeatherInfo(code).label).not.toBe('Condição indisponível')
    })
  })

  it('returns the unavailable condition with cloud icon and reference sky for unknown codes', () => {
    expect(getWeatherInfo(4)).toEqual({
      label: 'Condição indisponível',
      icon: 'i-cloud',
      sky: 'reference',
      color: UNKNOWN_CODE_COLOR,
    })
  })

  it('returns the unavailable condition for null and undefined codes', () => {
    expect(getWeatherInfo(null).label).toBe('Condição indisponível')
    expect(getWeatherInfo(undefined).label).toBe('Condição indisponível')
  })

  it('does not allow mutation of the returned object', () => {
    const info = getWeatherInfo(0)
    expect(Object.isFrozen(info)).toBe(true)
  })
})
