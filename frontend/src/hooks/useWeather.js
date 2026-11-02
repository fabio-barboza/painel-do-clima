import { useEffect, useRef, useState } from 'react'
import { fetchWeather, WEATHER_ERROR_KINDS, WeatherApiError } from '../api/weather.js'

const STATUS_IDLE = 'idle'
const STATUS_LOADING = 'loading'
const STATUS_READY = 'ready'
const BUSY_SEARCH = 'search'
const BUSY_LOCATE = 'locate'
const NOTICE_INFO = 'info'
const NOTICE_ERROR = 'error'
const REQUEST_TIMEOUT_MS = 20000
const GEOLOCATION_OPTIONS = Object.freeze({ enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 })
const SELF_LOCATION_LABEL = 'Sua localização'
const LOCATION_SEPARATOR = ', '
const CITY_KEY = 'city'
const ABORT_REASON_TIMEOUT = 'timeout'

const EMPTY_SEARCH_NOTICE = Object.freeze({
  kind: NOTICE_INFO,
  message: 'Digite o nome de uma cidade ou região para pesquisar.',
  canRetry: false,
})

const GEOLOCATION_NOTICE = Object.freeze({
  kind: NOTICE_ERROR,
  message: 'Não foi possível obter sua localização. Verifique a permissão do navegador ou pesquise pelo nome da cidade.',
  canRetry: false,
})

const NOTICE_BY_ERROR_KIND = Object.freeze({
  [WEATHER_ERROR_KINDS.INVALID]: Object.freeze({
    kind: NOTICE_ERROR,
    message: 'Não entendemos essa busca. Revise o texto e tente novamente.',
    canRetry: false,
  }),
  [WEATHER_ERROR_KINDS.NOT_FOUND]: Object.freeze({
    kind: NOTICE_ERROR,
    message: 'Não encontramos essa cidade. Confira o nome e tente novamente.',
    canRetry: false,
  }),
  [WEATHER_ERROR_KINDS.NETWORK]: Object.freeze({
    kind: NOTICE_ERROR,
    message: 'Não foi possível obter os dados do clima agora.',
    canRetry: true,
  }),
})

const INITIAL_VIEW = Object.freeze({
  status: STATUS_IDLE,
  busy: null,
  data: null,
  locationLabel: null,
  notice: null,
})

function buildApiErrorNotice(error) {
  if (!(error instanceof WeatherApiError)) return NOTICE_BY_ERROR_KIND[WEATHER_ERROR_KINDS.NETWORK]
  return NOTICE_BY_ERROR_KIND[error.kind] ?? NOTICE_BY_ERROR_KIND[WEATHER_ERROR_KINDS.NETWORK]
}

function buildLocationLabel(location) {
  if (!location?.name) return SELF_LOCATION_LABEL
  if (!location.region) return location.name
  return `${location.name}${LOCATION_SEPARATOR}${location.region}`
}

function busyForQuery(query) {
  return query[CITY_KEY] !== undefined ? BUSY_SEARCH : BUSY_LOCATE
}

function isCurrentRequest(session, requestId) {
  return session.current.id === requestId
}

function beginRequest(session) {
  session.current.id += 1
  session.current.controller?.abort()
  session.current.controller = null
  return session.current.id
}

function buildSettledView(view) {
  return { ...view, status: view.data ? STATUS_READY : STATUS_IDLE, busy: null }
}

function buildFailedView(view, notice) {
  return { ...buildSettledView(view), notice }
}

function buildReadyView(weather) {
  return {
    status: STATUS_READY,
    busy: null,
    data: weather,
    locationLabel: buildLocationLabel(weather.location),
    notice: null,
  }
}

async function runQuery(query, requestId, store) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(ABORT_REASON_TIMEOUT), REQUEST_TIMEOUT_MS)
  store.session.current.controller = controller
  store.session.current.lastQuery = query
  store.setView((view) => ({ ...view, status: STATUS_LOADING, busy: busyForQuery(query), notice: null }))
  try {
    const weather = await fetchWeather(query, { signal: controller.signal })
    if (isCurrentRequest(store.session, requestId)) store.setView(buildReadyView(weather))
  } catch (error) {
    if (isCurrentRequest(store.session, requestId)) {
      store.setView((view) => buildFailedView(view, buildApiErrorNotice(error)))
    }
  } finally {
    clearTimeout(timer)
  }
}

function handleGeolocationFailure(requestId, store) {
  if (!isCurrentRequest(store.session, requestId)) return
  store.setView((view) => buildFailedView(view, GEOLOCATION_NOTICE))
}

function handleGeolocationSuccess(requestId, store, position) {
  if (!isCurrentRequest(store.session, requestId)) return
  const { latitude, longitude } = position.coords
  runQuery({ lat: latitude, lon: longitude }, requestId, store)
}

export default function useWeather() {
  const [view, setView] = useState(INITIAL_VIEW)
  const session = useRef({ id: 0, controller: null, lastQuery: null })
  const store = { session, setView }

  useEffect(() => () => {
    beginRequest(session)
  }, [])

  function search(text) {
    const city = text.trim()
    if (!city) {
      setView((current) => ({ ...current, notice: EMPTY_SEARCH_NOTICE }))
      return
    }
    const requestId = beginRequest(session)
    runQuery({ [CITY_KEY]: city }, requestId, store)
  }

  function locate() {
    if (!navigator.geolocation) {
      setView((current) => buildFailedView(current, GEOLOCATION_NOTICE))
      return
    }
    const requestId = beginRequest(session)
    setView((current) => ({ ...buildSettledView(current), busy: BUSY_LOCATE, notice: null }))
    navigator.geolocation.getCurrentPosition(
      (position) => handleGeolocationSuccess(requestId, store, position),
      () => handleGeolocationFailure(requestId, store),
      GEOLOCATION_OPTIONS,
    )
  }

  function retry() {
    const query = session.current.lastQuery
    if (!query) return
    const requestId = beginRequest(session)
    runQuery(query, requestId, store)
  }

  return {
    status: view.status,
    busy: view.busy,
    data: view.data,
    locationLabel: view.locationLabel,
    notice: view.notice,
    search,
    locate,
    retry,
  }
}
