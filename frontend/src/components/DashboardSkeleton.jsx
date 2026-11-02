import React from 'react'
import Chip from './Chip.jsx'
import Icon from './Icon.jsx'

const DAY_COUNT = 7
const PLACEHOLDER_TEMPERATURE = '00°'
const PLACEHOLDER_TEMPERATURE_VALUE = '00'
const PLACEHOLDER_LOCATION = 'Cidade, Estado'
const PLACEHOLDER_CONDITION = 'Condição do tempo'
const PLACEHOLDER_UPDATED = 'Atualizado agora'
const PLACEHOLDER_DAY_NAME = 'Dom'
const PLACEHOLDER_DAY_DATE = '00 ago'
const PLACEHOLDER_RAIN = '00% · 0,0 mm'
const HOURLY_TITLE = 'Previsão por hora'
const HOURLY_SUBTITLE = 'Temperatura ao longo do dia'
const HOURLY_HINT = 'Passe o mouse ou toque no gráfico para ver os detalhes'
const WEEKLY_TITLE = 'Próximos 7 dias'
const WEEKLY_SUBTITLE = 'Previsão diária com probabilidade de chuva'
const TEMPERATURE_LEGEND = 'Temperatura (°C)'
const PRECIPITATION_LEGEND = 'Precipitação (mm)'
const DAY_ICON = 'cloud'
const DRY_ICON = 'drop'
const STAT_PLACEHOLDERS = Object.freeze([
  { icon: 'thermo', color: '#ff9f7a', label: 'Sensação térmica', figure: '00', unit: ' °C' },
  { icon: 'drop', color: '#7cc4ff', label: 'Umidade', figure: '00', unit: ' %' },
  { icon: 'wind', color: '#9be8c9', label: 'Vento', figure: '00', unit: ' km/h · NNO' },
  { icon: 'uv', color: '#ffd76a', label: 'Índice UV', figure: '0', lead: ' ', unit: '· Baixo' },
])
const DAY_INDEXES = Array.from({ length: DAY_COUNT }, (_, index) => index)
const HIDDEN_FROM_ASSISTIVE = 'true'
const EMPTY_BAR_STYLE = Object.freeze({ '--w': '0%' })

function SkeletonCurrent() {
  return (
    <section className="card current">
      <div className="current-top">
        <span className="loc">
          <Icon name="pin" />{' '}
          <span className="skel">{PLACEHOLDER_LOCATION}</span>
        </span>
        <span className="updated">
          <span className="pulse-dot"></span>{' '}
          <span className="skel">{PLACEHOLDER_UPDATED}</span>
        </span>
      </div>
      <div className="current-main">
        <div className="big-icon"></div>
        <div className="temp-block">
          <div className="temp is-skel">
            <span className="skel">{PLACEHOLDER_TEMPERATURE}</span>
          </div>
          <div className="condition">
            <span className="skel">{PLACEHOLDER_CONDITION}</span>
          </div>
        </div>
      </div>
      <div className="current-foot">
        <Chip tone="hot" icon="up">
          Máx <b><span className="skel">{PLACEHOLDER_TEMPERATURE}</span></b>
        </Chip>
        <Chip tone="cold" icon="down">
          Mín <b><span className="skel">{PLACEHOLDER_TEMPERATURE}</span></b>
        </Chip>
        <Chip>
          Sensação <b><span className="skel">{PLACEHOLDER_TEMPERATURE}</span></b>
        </Chip>
        <Chip icon={DRY_ICON}>
          Precipitação <b><span className="skel">{PLACEHOLDER_TEMPERATURE_VALUE} mm</span></b>
        </Chip>
      </div>
    </section>
  )
}

function SkeletonHourly() {
  return (
    <section className="card">
      <div className="card-head">
        <div>
          <h2>{HOURLY_TITLE}</h2>
          <div className="sub">{HOURLY_SUBTITLE}</div>
        </div>
        <span className="chart-legend">
          <span className="chip plain">
            <span className="dotline"></span> {TEMPERATURE_LEGEND}
          </span>
          <span className="chip plain">
            <span className="dotline rain"></span> {PRECIPITATION_LEGEND}
          </span>
        </span>
      </div>
      <div className="chart-wrap">
        <div className="skel chart-skel"></div>
      </div>
      <div className="chart-hint">{HOURLY_HINT}</div>
    </section>
  )
}

function SkeletonStat({ icon, color, label, figure, lead, unit }) {
  return (
    <div className="card stat">
      <div className="stat-top">
        <span className="stat-ico" style={{ color }}>
          <Icon name={icon} />
        </span>
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-val">
        <span className="skel">{figure}</span>
        {lead}
        <small>
          <span className="skel">{unit}</span>
        </small>
      </div>
      <div className="bar">
        <i style={EMPTY_BAR_STYLE}></i>
      </div>
    </div>
  )
}

function SkeletonStats() {
  return (
    <section className="grid-stats" aria-hidden={HIDDEN_FROM_ASSISTIVE}>
      {STAT_PLACEHOLDERS.map((stat) => (
        <SkeletonStat key={stat.label} {...stat} />
      ))}
    </section>
  )
}

function SkeletonDay() {
  return (
    <div className="day">
      <span className="d-name">
        <span className="skel">{PLACEHOLDER_DAY_NAME}</span>
      </span>
      <span className="d-date">
        <span className="skel">{PLACEHOLDER_DAY_DATE}</span>
      </span>
      <svg className="ico d-ico skel">
        <use href={`#i-${DAY_ICON}`} />
      </svg>
      <div className="d-temps">
        <b><span className="skel">{PLACEHOLDER_TEMPERATURE}</span></b>
        <span><span className="skel">{PLACEHOLDER_TEMPERATURE}</span></span>
      </div>
      <div className="d-rain">
        <Icon name={DRY_ICON} />{' '}
        <span className="skel">{PLACEHOLDER_RAIN}</span>
      </div>
      <div className="bar d-range">
        <i style={EMPTY_BAR_STYLE}></i>
      </div>
    </div>
  )
}

function SkeletonWeekly() {
  return (
    <section className="card" aria-hidden={HIDDEN_FROM_ASSISTIVE}>
      <div className="card-head">
        <div>
          <h2>{WEEKLY_TITLE}</h2>
          <div className="sub">{WEEKLY_SUBTITLE}</div>
        </div>
      </div>
      <div className="weekly-grid">
        {DAY_INDEXES.map((index) => (
          <SkeletonDay key={index} />
        ))}
      </div>
    </section>
  )
}

function DashboardSkeleton() {
  return (
    <>
      <div className="grid-main" aria-hidden={HIDDEN_FROM_ASSISTIVE}>
        <SkeletonCurrent />
        <SkeletonHourly />
      </div>
      <SkeletonStats />
      <SkeletonWeekly />
    </>
  )
}

export default DashboardSkeleton
