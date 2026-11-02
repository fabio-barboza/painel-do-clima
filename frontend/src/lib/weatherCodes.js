const GROUP_KEYS = Object.freeze({
  CLEAR: 'clear',
  PARTLY_CLOUDY: 'partlyCloudy',
  OVERCAST: 'overcast',
  FOG: 'fog',
  RAIN: 'rain',
  SNOW: 'snow',
  STORM: 'storm',
  UNKNOWN: 'unknown',
})

const CONDITION_GROUPS = Object.freeze({
  [GROUP_KEYS.CLEAR]: { icon: 'i-sun', sky: 'reference', color: '#ffd76a' },
  [GROUP_KEYS.PARTLY_CLOUDY]: { icon: 'i-cloud-sun', sky: 'reference', color: '#ffd76a' },
  [GROUP_KEYS.OVERCAST]: { icon: 'i-cloud', sky: 'cloudy', color: '#c9d6f2' },
  [GROUP_KEYS.FOG]: { icon: 'i-fog', sky: 'cloudy', color: '#c9d6f2' },
  [GROUP_KEYS.RAIN]: { icon: 'i-rain', sky: 'rain', color: '#7cc4ff' },
  [GROUP_KEYS.SNOW]: { icon: 'i-snow', sky: 'rain', color: '#c9d6f2' },
  [GROUP_KEYS.STORM]: { icon: 'i-storm', sky: 'rain', color: '#c9b8ff' },
  [GROUP_KEYS.UNKNOWN]: { icon: 'i-cloud', sky: 'reference', color: '#c9d6f2' },
})

const UNKNOWN_LABEL = 'Condição indisponível'

const CONDITION_ROWS = [
  [0, 'Céu limpo', GROUP_KEYS.CLEAR],
  [1, 'Predominantemente limpo', GROUP_KEYS.CLEAR],
  [2, 'Parcialmente nublado', GROUP_KEYS.PARTLY_CLOUDY],
  [3, 'Encoberto', GROUP_KEYS.OVERCAST],
  [45, 'Neblina', GROUP_KEYS.FOG],
  [48, 'Neblina com geada', GROUP_KEYS.FOG],
  [51, 'Garoa leve', GROUP_KEYS.RAIN],
  [53, 'Garoa moderada', GROUP_KEYS.RAIN],
  [55, 'Garoa intensa', GROUP_KEYS.RAIN],
  [56, 'Garoa congelante leve', GROUP_KEYS.RAIN],
  [57, 'Garoa congelante intensa', GROUP_KEYS.RAIN],
  [61, 'Chuva fraca', GROUP_KEYS.RAIN],
  [63, 'Chuva moderada', GROUP_KEYS.RAIN],
  [65, 'Chuva forte', GROUP_KEYS.RAIN],
  [66, 'Chuva congelante fraca', GROUP_KEYS.RAIN],
  [67, 'Chuva congelante forte', GROUP_KEYS.RAIN],
  [71, 'Neve fraca', GROUP_KEYS.SNOW],
  [73, 'Neve moderada', GROUP_KEYS.SNOW],
  [75, 'Neve forte', GROUP_KEYS.SNOW],
  [77, 'Grãos de neve', GROUP_KEYS.SNOW],
  [80, 'Pancadas de chuva fracas', GROUP_KEYS.RAIN],
  [81, 'Pancadas de chuva moderadas', GROUP_KEYS.RAIN],
  [82, 'Pancadas de chuva violentas', GROUP_KEYS.RAIN],
  [85, 'Pancadas de neve fracas', GROUP_KEYS.SNOW],
  [86, 'Pancadas de neve fortes', GROUP_KEYS.SNOW],
  [95, 'Trovoada', GROUP_KEYS.STORM],
  [96, 'Trovoada com granizo fraco', GROUP_KEYS.STORM],
  [97, 'Trovoada forte', GROUP_KEYS.STORM],
  [99, 'Trovoada com granizo forte', GROUP_KEYS.STORM],
]

const UNKNOWN_CONDITION = Object.freeze({
  label: UNKNOWN_LABEL,
  ...CONDITION_GROUPS[GROUP_KEYS.UNKNOWN],
})

const CONDITIONS_BY_CODE = new Map(
  CONDITION_ROWS.map(([code, label, group]) => [
    code,
    Object.freeze({ label, ...CONDITION_GROUPS[group] }),
  ]),
)

export function getWeatherInfo(code) {
  return CONDITIONS_BY_CODE.get(code) ?? UNKNOWN_CONDITION
}
