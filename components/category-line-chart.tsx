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
import { fetchCategories, type CategoryData } from "@/lib/chart-data"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function CategoryLineChart() {
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("🔍 [DEBUG] CategoryLineChart: Starting to load data")
        const data = await fetchCategories()
        console.log("🔍 [DEBUG] CategoryLineChart: Received data:", data)
        console.log("🔍 [DEBUG] CategoryLineChart: Data length:", data.length)
        console.log("🔍 [DEBUG] CategoryLineChart: Categories:", data.map(item => item.category))
        console.log("🔍 [DEBUG] CategoryLineChart: Amounts:", data.map(item => item.amount))
        setCategoryData(data)
      } catch (error) {
        console.error("❌ [DEBUG] CategoryLineChart: Error loading category data:", error)
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

  if (categoryData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-gray-500">No category data available</div>
      </div>
    )
  }

  const hasValidData = categoryData.some(item => item.amount > 0)
  if (!hasValidData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-gray-500">No spending data available for categories</div>
      </div>
    )
  }

  console.log("🔍 [DEBUG] CategoryLineChart: Rendering chart with categoryData:", categoryData)
  console.log("🔍 [DEBUG] CategoryLineChart: CategoryData length:", categoryData.length)
  console.log("🔍 [DEBUG] CategoryLineChart: CategoryData structure:", categoryData.map(item => ({ category: item.category, amount: item.amount, count: item.count })))

  const chartData = {
    labels: categoryData.map((item) => item.category),
    datasets: [
      {
        label: "Spending Amount ($)",
        data: categoryData.map((item) => item.amount),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
      },
    ],
  }

  console.log("🔍 [DEBUG] CategoryLineChart: Chart data prepared:", chartData)
  console.log("🔍 [DEBUG] CategoryLineChart: Labels:", chartData.labels)
  console.log("🔍 [DEBUG] CategoryLineChart: Dataset data:", chartData.datasets[0].data)
  console.log("🔍 [DEBUG] CategoryLineChart: Dataset data type:", typeof chartData.datasets[0].data[0])
  console.log("🔍 [DEBUG] CategoryLineChart: Dataset data length:", chartData.datasets[0].data.length)
  console.log("🔍 [DEBUG] CategoryLineChart: Any non-zero amounts:", chartData.datasets[0].data.some(amount => amount > 0))

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
      x: {
        ticks: {
          maxRotation: 45,
        },
      },
    },
  }

  return (
    <div className="w-full h-full p-4">
      <div className="mb-4 text-sm text-gray-600">
        <div>Categories: {chartData.labels.length}</div>
        <div>Total Amount: ${chartData.datasets[0].data.reduce((sum, amount) => sum + amount, 0).toLocaleString()}</div>
      </div>
      <Line data={chartData} options={options} />
    </div>
  )
}

// Named export for compatibility
export { CategoryLineChart }
