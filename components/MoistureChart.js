"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export default function MoistureChart({ data, threshold = 40 }) {
  const getColor = (value) => {
    if (value <= threshold) return '#f85149'; // danger-red
    if (value <= threshold + 10) return '#d29922'; // warning-yellow
    return '#2ea043'; // primary-green
  };

  const getGlowColor = (value) => {
    if (value <= threshold) return 'rgba(248, 81, 73, 0.2)';
    if (value <= threshold + 10) return 'rgba(210, 153, 34, 0.2)';
    return 'rgba(46, 160, 67, 0.2)';
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(22, 27, 34, 0.9)',
        titleColor: '#e6edf3',
        bodyColor: '#e6edf3',
        borderColor: 'rgba(48, 54, 61, 0.5)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Moisture: ${context.parsed.y}%`;
          }
        }
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(48, 54, 61, 0.3)',
        },
        ticks: {
          color: '#8b949e',
          callback: function(value) {
            return value + '%';
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#8b949e',
          maxTicksLimit: 8
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  const chartData = {
    labels: data.map(d => d.time),
    datasets: [
      {
        fill: true,
        label: 'Moisture Level',
        data: data.map(d => d.value),
        backgroundColor: 'rgba(255, 255, 255, 0.03)', // Neutral background
        tension: 0.4,
        segment: {
          borderColor: ctx => getColor(ctx.p1.parsed.y)
        },
        pointBackgroundColor: ctx => getColor(ctx.raw),
        pointBorderColor: ctx => getColor(ctx.raw),
        pointRadius: 2,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: ctx => getColor(ctx.raw),
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Line options={options} data={chartData} />
    </div>
  );
}
