import React from 'react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatPrecipitation, formatTemperature } from '../utils/weatherCode.js'

function HourlyChartTooltip({ active, payload }) {
  if (!active || !payload || payload.length === 0) {
    return null
  }
  const point = payload[0].payload
  return (
    <div className="hourly-chart-tooltip" role="status" aria-live="polite">
      <p className="hourly-chart-tooltip-hour">{point.hour}</p>
      <p className="hourly-chart-tooltip-row">
        <span className="hourly-chart-tooltip-label">Temperatura</span>
        <span className="hourly-chart-tooltip-value">{formatTemperature(point.temperature)}</span>
      </p>
      <p className="hourly-chart-tooltip-row">
        <span className="hourly-chart-tooltip-label">Precipitação</span>
        <span className="hourly-chart-tooltip-value">{formatPrecipitation(point.precipitation)}</span>
      </p>
    </div>
  )
}

function HourlyChart({ data = [] }) {
  return (
    <div className="hourly-chart">
      <div
        className="hourly-chart-canvas"
        role="img"
        aria-label="Gráfico das próximas 24 horas: linha com a temperatura em graus Celsius e barras com a precipitação em milímetros."
      >
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} accessibilityLayer>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="hour"
              interval={2}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-border-strong)' }}
              tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
            />
            <YAxis
              yAxisId="temperature"
              tickLine={false}
              axisLine={false}
              width={44}
              tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
              tickFormatter={(value) => `${value} °C`}
            />
            <YAxis
              yAxisId="precipitation"
              orientation="right"
              tickLine={false}
              axisLine={false}
              width={44}
              domain={[0, 'auto']}
              tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
              tickFormatter={(value) => `${value} mm`}
            />
            <Tooltip content={<HourlyChartTooltip />} isAnimationActive={false} />
            <Bar
              yAxisId="precipitation"
              dataKey="precipitation"
              name="Precipitação"
              fill="var(--color-rain)"
              fillOpacity={0.7}
              barSize={8}
              isAnimationActive={false}
            />
            <Line
              yAxisId="temperature"
              type="monotone"
              dataKey="temperature"
              name="Temperatura"
              stroke="var(--color-accent)"
              strokeWidth={2}
              dot={{ r: 2, fill: 'var(--color-accent)' }}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <table className="visually-hidden">
        <caption>Previsão por hora das próximas 24 horas: temperatura em graus Celsius e precipitação em milímetros</caption>
        <thead>
          <tr>
            <th scope="col">Hora</th>
            <th scope="col">Temperatura (°C)</th>
            <th scope="col">Precipitação (mm)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.hour}>
              <th scope="row">{point.hour}</th>
              <td>{formatTemperature(point.temperature)}</td>
              <td>{formatPrecipitation(point.precipitation)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default HourlyChart
