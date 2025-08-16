"use client"

import { useEffect, useState } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { useFinancialData } from "@/hooks/useFinancialData"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function CategoryLineChart() {
  const { categories, loading, error } = useFinancialData()

  useEffect(() => {
    console.log('[DEBUG] CategoryLineChart: Component mounted, user data:', { 
      categoriesCount: categories.length,
      loading,
      error,
      categoriesData: categories
    })
  }, [categories, loading, error])

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

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-gray-500">No category data available</div>
      </div>
    )
  }

  // Debug: Log the exact data being used for the chart
  const chartData = {
    labels: categories.map((item) => item.category),
    datasets: [
      {
        label: "Spending Amount ($)",
        data: categories.map((item) => item.amount),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
      },
    ],
  }

  console.log('[DEBUG] CategoryLineChart: Chart data prepared:', {
    labels: chartData.labels,
    data: chartData.datasets[0].data,
    rawCategories: categories
  })

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Category Breakdown - Line View",
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
    <div className="w-full h-full p-4">
      <Line data={chartData} options={options} />
    </div>
  )
}

// Named export for compatibility
export { CategoryLineChart }
