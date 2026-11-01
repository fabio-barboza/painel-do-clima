const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']

function toInt(dateIso, start, end) {
  return Number(dateIso.slice(start, end))
}

function capitalizeShort(word) {
  return word.slice(0, 3).replace(/^./, letter => letter.toUpperCase())
}

function weekdayIndex(dateIso) {
  const year = toInt(dateIso, 0, 4)
  const month = toInt(dateIso, 5, 7)
  const day = toInt(dateIso, 8, 10)
  const t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4]
  const yearShifted = year - (month <= 2 ? 1 : 0)
  return (yearShifted + Math.floor(yearShifted / 4) - Math.floor(yearShifted / 100) + Math.floor(yearShifted / 400) + t[month - 1] + day) % 7
}

export function formatTimeFromIso(iso) {
  return iso.slice(11, 16)
}

export function formatDayLabel(dateIso, index) {
  if (index === 0) {
    return 'Hoje'
  }
  return capitalizeShort(SEMANA[weekdayIndex(dateIso)])
}

export function formatShortDate(dateIso) {
  const day = toInt(dateIso, 8, 10)
  const month = toInt(dateIso, 5, 7)
  return day + ' ' + MESES[month - 1]
}

export function formatNumber(value, digits = 0) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}
