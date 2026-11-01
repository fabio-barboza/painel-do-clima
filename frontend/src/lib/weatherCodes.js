const WMO = {
  0: { label: 'Céu limpo', icon: 'sun', color: '#ffd76a', tint: 'clear' },
  1: { label: 'Predominadamente limpo', icon: 'sun', color: '#ffd76a', tint: 'clear' },
  2: { label: 'Parcialmente nublado', icon: 'cloud-sun', color: '#ffd76a', tint: 'cloudy' },
  3: { label: 'Nublado', icon: 'cloud', color: '#c9d6f2', tint: 'cloudy' },
  45: { label: 'Neblina', icon: 'cloud', color: '#c9d6f2', tint: 'cloudy' },
  48: { label: 'Neblina com geada', icon: 'cloud', color: '#c9d6f2', tint: 'cloudy' },
  51: { label: 'Garoa fraca', icon: 'rain', color: '#7cc4ff', tint: 'rain' },
  53: { label: 'Garoa', icon: 'rain', color: '#7cc4ff', tint: 'rain' },
  55: { label: 'Garoa intensa', icon: 'rain', color: '#7cc4ff', tint: 'rain' },
  56: { label: 'Garoa congelante', icon: 'rain', color: '#7cc4ff', tint: 'rain' },
  57: { label: 'Garoa congelante', icon: 'rain', color: '#7cc4ff', tint: 'rain' },
  61: { label: 'Chuva fraca', icon: 'rain', color: '#7cc4ff', tint: 'rain' },
  63: { label: 'Chuva', icon: 'rain', color: '#7cc4ff', tint: 'rain' },
  65: { label: 'Chuva forte', icon: 'rain', color: '#7cc4ff', tint: 'rain' },
  66: { label: 'Chuva congelante', icon: 'rain', color: '#7cc4ff', tint: 'rain' },
  67: { label: 'Chuva congelante', icon: 'rain', color: '#7cc4ff', tint: 'rain' },
  71: { label: 'Neve fraca', icon: 'cloud', color: '#c9d6f2', tint: 'cloudy' },
  73: { label: 'Neve', icon: 'cloud', color: '#c9d6f2', tint: 'cloudy' },
  75: { label: 'Neve forte', icon: 'cloud', color: '#c9d6f2', tint: 'cloudy' },
  77: { label: 'Grãos de neve', icon: 'cloud', color: '#c9d6f2', tint: 'cloudy' },
  80: { label: 'Pancadas de chuva', icon: 'rain', color: '#7cc4ff', tint: 'rain' },
  81: { label: 'Pancadas de chuva', icon: 'rain', color: '#7cc4ff', tint: 'rain' },
  82: { label: 'Pancadas de chuva', icon: 'rain', color: '#7cc4ff', tint: 'rain' },
  85: { label: 'Pancadas de neve', icon: 'cloud', color: '#c9d6f2', tint: 'cloudy' },
  86: { label: 'Pancadas de neve', icon: 'cloud', color: '#c9d6f2', tint: 'cloudy' },
  95: { label: 'Trovoada', icon: 'storm', color: '#c9b8ff', tint: 'rain' },
  96: { label: 'Trovoada com granizo', icon: 'storm', color: '#c9b8ff', tint: 'rain' },
  99: { label: 'Trovoada com granizo', icon: 'storm', color: '#c9b8ff', tint: 'rain' },
}

const FALLBACK = { label: 'Nublado', icon: 'cloud', color: '#c9d6f2', tint: 'cloudy' }

const CARDINAIS = ['N', 'NNE', 'NE', 'ENE', 'L', 'LSE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO']

export function weatherCodeInfo(code) {
  return WMO[code] || FALLBACK
}

export function uvLabel(value) {
  const rounded = Math.round(value)
  if (rounded < 3) return 'Baixo'
  if (rounded < 6) return 'Moderado'
  if (rounded < 8) return 'Alto'
  if (rounded < 11) return 'Muito Alto'
  return 'Extremo'
}

export function windCardinal(deg) {
  return CARDINAIS[Math.round(deg / 22.5) % 16]
}
