"use client"

import { useEffect, useState } from "react"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { Slider } from "@/components/ui/slider"
import { fetchSources, type PaymentSourceData } from "@/lib/chart-data"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export function PaymentSourceBalances() {
  const [sourceData, setSourceData] = useState<PaymentSourceData[]>([])
  const [threshold, setThreshold] = useState([500])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchSources()
        setSourceData(data)
      } catch (error) {
        console.error("Error loading source data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-gray-500">Loading chart data...</div>
      </div>
    )
  }

  const filteredData = sourceData.filter((item) => item.balance >= threshold[0])

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
