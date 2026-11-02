import React from 'react'
import HourlyChart from './HourlyChart.jsx'
import useReveal from '../hooks/useReveal.js'
import { selectTodayHours } from '../lib/format.js'

const CARD_DELAY = '.16s'

function HourlyCard({ weather }) {
  const [ref, revealed] = useReveal()
  const series = selectTodayHours(weather.hourly, weather.current.time)

  return (
    <section
      ref={ref}
      id="chartCard"
      className={revealed ? 'card reveal in' : 'card reveal'}
      style={{ '--d': CARD_DELAY }}
      aria-label="Previsão por hora"
    >
      <div className="card-head">
        <div>
          <h2>Previsão por hora</h2>
          <div className="sub">Temperatura ao longo do dia</div>
        </div>
        <span className="chart-legend">
          <span className="chip plain">
            <span className="dotline"></span> Temperatura (°C)
          </span>
          <span className="chip plain">
            <span className="dotline rain"></span> Precipitação (mm)
          </span>
        </span>
      </div>
      <div className="chart-wrap" id="chartWrap">
        <HourlyChart
          times={series.times}
          temps={series.temps}
          precip={series.precip}
          nowIndex={series.nowIndex}
          revealed={revealed}
        />
      </div>
      <div className="chart-hint">Passe o mouse ou toque no gráfico para ver os detalhes</div>
    </section>
  )
}

export default HourlyCard
