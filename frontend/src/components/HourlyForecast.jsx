import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './HourlyForecast.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

function formatHour(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function HourlyForecast({ hourlyData }) {
  if (!hourlyData || !hourlyData.time) return null;

  const next24 = hourlyData.time.slice(0, 24);
  const temperatures = hourlyData.temperature_2m.slice(0, 24);
  const precipitation = hourlyData.precipitation.slice(0, 24);

  const labels = next24.map(formatHour);

  const data = {
    labels,
    datasets: [
      {
        label: 'Temperatura (°C)',
        data: temperatures,
        yAxisID: 'y',
        borderColor: '#cbb7fb',
        backgroundColor: 'rgba(203, 183, 251, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5
      },
      {
        label: 'Precipitação (mm)',
        data: precipitation,
        yAxisID: 'y1',
        borderColor: '#42A5F5',
        backgroundColor: 'rgba(66, 165, 245, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: "'Super Sans VF', system-ui, sans-serif",
            size: 14
          },
          color: '#292827'
        }
      },
      tooltip: {
        backgroundColor: '#292827',
        titleFont: {
          family: "'Super Sans VF', system-ui, sans-serif"
        },
        bodyFont: {
          family: "'Super Sans VF', system-ui, sans-serif"
        }
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            family: "'Super Sans VF', system-ui, sans-serif",
            size: 12
          },
          color: '#292827',
          maxRotation: 45
        },
        grid: {
          color: 'rgba(220, 215, 211, 0.3)'
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Temperatura (°C)',
          font: {
            family: "'Super Sans VF', system-ui, sans-serif",
            size: 14
          },
          color: '#cbb7fb'
        },
        ticks: {
          font: {
            family: "'Super Sans VF', system-ui, sans-serif",
            size: 12
          },
          color: '#292827'
        },
        grid: {
          color: 'rgba(220, 215, 211, 0.3)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Precipitação (mm)',
          font: {
            family: "'Super Sans VF', system-ui, sans-serif",
            size: 14
          },
          color: '#42A5F5'
        },
        ticks: {
          font: {
            family: "'Super Sans VF', system-ui, sans-serif",
            size: 12
          },
          color: '#292827'
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };

  return (
    <div className="hourly-forecast">
      <h3 className="hourly-forecast__title section-title">Previsão por hora</h3>
      <div className="hourly-forecast__chart">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
