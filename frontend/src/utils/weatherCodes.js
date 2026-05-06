const CODE_MAP = {
  0: { label: 'Céu limpo', icon: 'clear', color: '#4A90D9' },
  1: { label: 'Predominantemente limpo', icon: 'mostly-clear', color: '#5B9BD5' },
  2: { label: 'Parcialmente nublado', icon: 'partly-cloudy', color: '#87CEEB' },
  3: { label: 'Nublado', icon: 'overcast', color: '#9E9E9E' },
  45: { label: 'Nevoeiro', icon: 'fog', color: '#B0BEC5' },
  48: { label: 'Nevoeiro com geada', icon: 'fog', color: '#B0BEC5' },
  51: { label: 'Garoa leve', icon: 'drizzle', color: '#78909C' },
  53: { label: 'Garoa moderada', icon: 'drizzle', color: '#607D8B' },
  55: { label: 'Garoa intensa', icon: 'drizzle', color: '#546E7A' },
  56: { label: 'Garoa congelante leve', icon: 'freezing-drizzle', color: '#80DEEA' },
  57: { label: 'Garoa congelante intensa', icon: 'freezing-drizzle', color: '#4DD0E1' },
  61: { label: 'Chuva leve', icon: 'rain', color: '#42A5F5' },
  63: { label: 'Chuva moderada', icon: 'rain', color: '#1E88E5' },
  65: { label: 'Chuva forte', icon: 'rain', color: '#1565C0' },
  66: { label: 'Chuva congelante leve', icon: 'freezing-rain', color: '#00ACC1' },
  67: { label: 'Chuva congelante intensa', icon: 'freezing-rain', color: '#00838F' },
  71: { label: 'Neve leve', icon: 'snow', color: '#E0E0E0' },
  73: { label: 'Neve moderada', icon: 'snow', color: '#BDBDBD' },
  75: { label: 'Neve intensa', icon: 'snow', color: '#9E9E9E' },
  77: { label: 'Granizo', icon: 'hail', color: '#CFD8DC' },
  80: { label: 'Pancadas de chuva leves', icon: 'rain', color: '#42A5F5' },
  81: { label: 'Pancadas de chuva moderadas', icon: 'rain', color: '#1E88E5' },
  82: { label: 'Pancadas de chuva fortes', icon: 'rain', color: '#1565C0' },
  85: { label: 'Pancadas de neve leves', icon: 'snow', color: '#E0E0E0' },
  86: { label: 'Pancadas de neve fortes', icon: 'snow', color: '#9E9E9E' },
  95: { label: 'Tempestade', icon: 'thunderstorm', color: '#5C6BC0' },
  96: { label: 'Tempestade com granizo leve', icon: 'thunderstorm', color: '#3F51B5' },
  99: { label: 'Tempestade com granizo forte', icon: 'thunderstorm', color: '#283593' }
};

const DEFAULT_CODE = { label: 'Desconhecido', icon: 'unknown', color: '#9E9E9E' };

function getCodeEntry(code) {
  return CODE_MAP[code] || DEFAULT_CODE;
}

export const weatherCodes = {
  getLabel(code) {
    return getCodeEntry(code).label;
  },

  getIconName(code) {
    return getCodeEntry(code).icon;
  },

  getThemeColor(code) {
    return getCodeEntry(code).color;
  }
};
