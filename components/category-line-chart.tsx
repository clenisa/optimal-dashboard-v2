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

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function CategoryLineChart() {
  const { categories, loading, error } = useFinancialData()
  const [useTestData, setUseTestData] = useState(false)

  // Debug: Validate data structure
  useEffect(() => {
    console.log('[DEBUG] CategoryLineChart: Data validation:', {
      categoriesLength: categories.length,
      categoriesData: categories,
      hasValidData: categories.length > 0 && categories.every(cat => 
        cat.category && typeof cat.amount === 'number'
      )
    })
  }, [categories])

  // Debug: Verify Chart.js registration
  useEffect(() => {
    console.log('[DEBUG] CategoryLineChart: Chart.js registered components:', {
      registry: ChartJS.registry,
      plugins: ChartJS.registry.plugins?.items || 'No plugins found',
      scales: ChartJS.registry.scales?.items || 'No scales found'
    })
  }, [])

  // Debug: Log every time the component renders
  console.log('[DEBUG] CategoryLineChart: Render triggered with:', {
    categories,
    loading,
    error,
    categoriesLength: categories?.length || 0,
    useTestData
  })

  // Temporary test data to verify Chart.js works
  const testData = {
    labels: ['Test Category 1', 'Test Category 2', 'Test Category 3'],
    datasets: [{
      label: 'Test Data',
      data: [100, 200, 150],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.1,
      fill: false,
      pointRadius: 4,
      pointHoverRadius: 6,
    }]
  }

  if (loading) {
    console.log('[DEBUG] CategoryLineChart: Showing loading state')
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-gray-500">Loading chart data...</div>
      </div>
    )
  }

  if (error) {
    console.log('[DEBUG] CategoryLineChart: Showing error state:', error)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-red-500">Error: {error}</div>
      </div>
    )
  }

  if (!categories || categories.length === 0) {
    console.log('[DEBUG] CategoryLineChart: Showing no data state - categories:', categories)
    return (
      <div className="w-full h-full p-4 space-y-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setUseTestData(!useTestData)}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {useTestData ? 'Hide Test Data' : 'Show Test Data'}
          </button>
          <span className="text-sm text-gray-600">No real data available</span>
        </div>
        {useTestData && (
          <div style={{ position: 'relative', height: '400px', width: '100%' }}>
            <Line data={testData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: "top" as const },
                title: { display: true, text: "Test Chart - Category Breakdown" },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value: any) {
                      return "$" + value.toLocaleString()
                    },
                  },
                },
              },
            }} />
          </div>
        )}
      </div>
    )
  }

  // Validate data before rendering
  const validCategories = categories.filter(cat => 
    cat.category && typeof cat.amount === 'number' && cat.amount > 0
  )

  if (validCategories.length === 0) {
    console.log('[DEBUG] CategoryLineChart: No valid category data found')
    return (
      <div className="w-full h-full p-4 space-y-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setUseTestData(!useTestData)}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {useTestData ? 'Hide Test Data' : 'Show Test Data'}
          </button>
          <span className="text-sm text-gray-600">No valid category data found</span>
        </div>
        {useTestData && (
          <div style={{ position: 'relative', height: '400px', width: '100%' }}>
            <Line data={testData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: "top" as const },
                title: { display: true, text: "Test Chart - Category Breakdown" },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value: any) {
                      return "$" + value.toLocaleString()
                    },
                  },
                },
              },
            }} />
          </div>
        )}
      </div>
    )
  }

  // Debug: Log the exact data being used for the chart
  const chartData = {
    labels: validCategories.map((item) => item.category),
    datasets: [
      {
        label: "Spending Amount ($)",
        data: validCategories.map((item) => Number(item.amount)),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  console.log('[DEBUG] CategoryLineChart: Chart data prepared:', {
    labels: chartData.labels,
    data: chartData.datasets[0].data,
    rawCategories: categories,
    validCategories: validCategories,
    chartDataObject: chartData
  })

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
          callback: function(value: any) {
            return "$" + value.toLocaleString()
          },
        },
      },
    },
  }

  console.log('[DEBUG] CategoryLineChart: About to render chart with data:', chartData)
  
  return (
    <div className="w-full h-full p-4">
      <div style={{ position: 'relative', height: '400px', width: '100%' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}

// Named export for compatibility
export { CategoryLineChart }
