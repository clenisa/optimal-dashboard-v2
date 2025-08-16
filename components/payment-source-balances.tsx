"use client"

import { useEffect, useState } from "react"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { Slider } from "@/components/ui/slider"
import { useFinancialData } from "@/hooks/useFinancialData"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export function PaymentSourceBalances() {
  const { sources, loading, error } = useFinancialData()
  const [threshold, setThreshold] = useState([500])

  useEffect(() => {
    console.log('[DEBUG] PaymentSourceBalances: Component mounted, user data:', { 
      sourcesCount: sources.length,
      loading,
      error,
      sourcesData: sources
    })
  }, [sources, loading, error])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-gray-500">Loading chart data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-red-500">Error: {error}</div>
      </div>
    )
  }

  if (sources.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-gray-500">No payment source data available</div>
      </div>
    )
  }

  const filteredData = sources.filter((item) => item.balance >= threshold[0])

  // Debug: Log the exact data being used for the chart
  const chartData = {
    labels: filteredData.map((item) => item.source),
    datasets: [
      {
        label: "Balance ($)",
        data: filteredData.map((item) => item.balance),
        backgroundColor: [
          "rgba(255, 99, 132, 0.8)",
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 205, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(153, 102, 255, 0.8)",
          "rgba(255, 159, 64, 0.8)",
          "rgba(199, 199, 199, 0.8)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 205, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(199, 199, 199, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }

  console.log('[DEBUG] PaymentSourceBalances: Chart data prepared:', {
    labels: chartData.labels,
    data: chartData.datasets[0].data,
    rawSources: sources,
    filteredData: filteredData
  })

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Payment Source Balances",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => "$" + value.toLocaleString(),
        },
      },
    },
  }

  return (
    <div className="w-full h-full p-4 space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Minimum Balance Threshold: ${threshold[0]}</label>
        <Slider value={threshold} onValueChange={setThreshold} max={3000} min={0} step={50} className="w-full" />
      </div>
      <div className="flex-1">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  )
}
