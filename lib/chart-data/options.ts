import type { ChartOptions } from 'chart.js'

export function buildCategoryChartOptions(): ChartOptions<'line'> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Category Analysis - actual mode',
        color: '#111827',
        font: { size: 16, weight: 'bold' },
      },
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#111827',
          font: { size: 12 },
          usePointStyle: true,
          pointStyle: 'line',
          padding: 20,
        },
      },
      tooltip: {
        mode: 'point',
        intersect: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#4ecdc4',
        borderWidth: 1,
        callbacks: {
          title(context) {
            const datasetLabel = context[0]?.dataset?.label ?? 'Category'
            const month = context[0]?.label ?? ''
            return `${datasetLabel} - ${month}`
          },
          label(context) {
            const value = context.parsed.y ?? 0
            return `Amount: $${Number(value).toLocaleString()}`
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        border: { display: false },
        ticks: { color: '#111827', font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        border: { display: false },
        ticks: {
          color: '#111827',
          font: { size: 11 },
          callback(value) {
            return `$${Number(value).toLocaleString()}`
          },
        },
        beginAtZero: true,
      },
    },
    interaction: {
      mode: 'point',
      intersect: true,
    },
  }
}
