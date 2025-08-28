"use client"

import { useEffect, useState, useRef } from "react"
import { Line, Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { useFinancialData } from "@/hooks/useFinancialData"
import { generateMultiCategoryData } from "@/lib/chart-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info, TrendingUp, TrendingDown, Target } from "lucide-react"

// Register Chart.js components
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

// Chart Descriptions and Insights
const CHART_DESCRIPTIONS = {
  title: "Spending Trends by Category",
  description: "Track how your spending in different categories changes over time. Look for patterns, seasonal variations, and opportunities to optimize your budget.",
  insights: [
    "Identify categories with increasing spending trends",
    "Spot seasonal patterns in your expenses",
    "Compare current month vs previous months",
    "Set category-specific budget goals"
  ]
}

export default function CategoryLineChart() {
  const { categories, transactions, loading, error } = useFinancialData()
  const [useTestData, setUseTestData] = useState(false)
  const [chartType, setChartType] = useState<'line' | 'bar' | 'source'>('line')
  const [allVisible, setAllVisible] = useState(true)
  const chartRef = useRef<any>(null)

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

  // Prepare multi-category monthly datasets
  const validCategories = categories.filter(cat => cat.category)

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

  // Build chart data based on selected type
  const chartData = chartType === 'line' 
    ? generateMultiCategoryData(transactions, validCategories)
    : chartType === 'bar'
    ? generateMultiCategoryData(transactions, validCategories)
    : { labels: ['Source Analysis'], datasets: [{ label: 'Coming Soon', data: [0] }] }

  console.log('[DEBUG] CategoryLineChart: Chart data prepared:', {
    labels: chartData.labels,
    data: chartData.datasets[0].data,
    rawCategories: categories,
    validCategories: validCategories,
    chartDataObject: chartData
  })

  const chartOptions = {
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
        position: 'top' as const,
        labels: {
          color: '#111827',
          font: { size: 12 },
          usePointStyle: true,
          pointStyle: 'line' as const,
          padding: 20,
        },
      },
      tooltip: {
        mode: 'point' as const,
        intersect: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#4ecdc4',
        borderWidth: 1,
        callbacks: {
          title: function(context: any) {
            const datasetLabel = context[0].dataset.label
            const month = context[0].label
            return `${datasetLabel} - ${month}`
          },
          label: function(context: any) {
            const value = context.parsed.y
            return `Amount: $${Number(value).toLocaleString()}`
          }
        }
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
        ticks: { color: '#111827', font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
        ticks: {
          color: '#111827',
          font: { size: 11 },
          callback: function(value: any) {
            return '$' + Number(value).toLocaleString()
          },
        },
        beginAtZero: true,
      },
    },
    interaction: {
      mode: 'point' as const,
      intersect: true,
    },
  }

  const toggleAllCategories = () => {
    if (chartRef.current) {
      const chart = chartRef.current
      const newVisibility = !allVisible
      chart.data.datasets.forEach((_: any, index: number) => {
        chart.setDatasetVisibility(index, newVisibility)
      })
      chart.update()
      setAllVisible(newVisibility)
    }
  }

  console.log('[DEBUG] CategoryLineChart: About to render chart with data:', chartData)
  
  return (
    <div className="w-full h-full p-4 space-y-6">
      {/* Chart Description and Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {CHART_DESCRIPTIONS.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            {CHART_DESCRIPTIONS.description}
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Key Insights */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                Key Insights
              </h4>
              <ul className="space-y-2 text-sm">
                {CHART_DESCRIPTIONS.insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Chart Statistics */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Info className="h-4 w-4 text-green-600" />
                Chart Statistics
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="text-lg font-bold text-blue-600">
                    {validCategories.length}
                  </div>
                  <div className="text-xs text-gray-500">Categories</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="text-lg font-bold text-green-600">
                    ${validCategories.reduce((sum, cat) => sum + Number(cat.amount), 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Total Amount</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Spending Trends Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Chart Type Selector and All Toggle */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label htmlFor="chart-type-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Visualization Type:
              </label>
              <select
                id="chart-type-select"
                value={chartType}
                onChange={(e) => setChartType(e.target.value as 'line' | 'bar' | 'source')}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="line">Category Breakdown (Line)</option>
                <option value="bar">Category Breakdown (Bar)</option>
                <option value="source">Source Analysis</option>
              </select>
            </div>
            {chartType !== 'source' && (
              <button
                onClick={toggleAllCategories}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {allVisible ? 'Hide All' : 'Show All'}
              </button>
            )}
          </div>
          <div style={{ position: 'relative', height: '400px', width: '100%' }}>
            {chartType === 'line' ? (
              <Line ref={chartRef} data={chartData} options={chartOptions} />
            ) : chartType === 'bar' ? (
              <Bar ref={chartRef} data={chartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Source Analysis - Coming Soon
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Named export for compatibility
export { CategoryLineChart }
