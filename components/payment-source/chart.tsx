"use client"

import { Bar } from "react-chartjs-2"
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from "chart.js"
import { CHART_COLORS } from '@/lib/theme'
import type { PaymentSource, ChartData, PaymentSourceChartProps } from './types'

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend
)

export function PaymentSourceChart({ sources, threshold }: PaymentSourceChartProps) {
  const generateChartData = (sources: PaymentSource[]): ChartData => {
    const labels = sources.map(source => source.source)
    const utilization = sources.map(source => {
      if (source.type === 'credit' && source.max_balance && source.max_balance > 0) {
        return Math.round((source.balance / source.max_balance) * 100)
      }
      return 0
    })

    return {
      labels,
      datasets: [
        {
          label: "Utilization (%)",
          data: utilization,
          backgroundColor: CHART_COLORS.primary,
          borderColor: CHART_COLORS.borders,
          borderWidth: 1,
        },
        {
          type: "line" as const,
          label: `Threshold (${threshold}%)`,
          data: Array(labels.length).fill(threshold),
          borderColor: CHART_COLORS.threshold,
          backgroundColor: CHART_COLORS.thresholdBackground,
          borderWidth: 2,
          pointRadius: 0,
        },
      ],
    }
  }

  const chartData = generateChartData(sources)

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: "top" as const 
      },
      title: { 
        display: true, 
        text: "Credit Utilization by Source" 
      },
    },
    scales: {
      y: { 
        beginAtZero: true, 
        max: 100, 
        title: { 
          display: true, 
          text: "Utilization %" 
        } 
      },
    },
  }

  return (
    <div className="h-64">
      <Bar data={chartData} options={chartOptions} />
    </div>
  )
}

