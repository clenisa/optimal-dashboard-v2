"use client"

import { useEffect, useState } from "react"
import { Bar } from "react-chartjs-2"
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from "chart.js"
import { Slider } from "@/components/ui/slider"
import { useFinancialData } from "@/hooks/useFinancialData"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info, Wallet, TrendingUp, AlertTriangle } from "lucide-react"

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

// Balance Descriptions and Features
const BALANCE_DESCRIPTIONS = {
  title: "Account Balances Overview",
  description: "Monitor your account balances across different payment sources and financial institutions.",
  features: [
    "Real-time balance updates",
    "Historical balance trends",
    "Account performance comparison",
    "Low balance alerts"
  ]
}

export function PaymentSourceBalances() {
  const { sources, loading, error } = useFinancialData()
  const [threshold, setThreshold] = useState(500)
  const [useTestData, setUseTestData] = useState(false)
  const [paydownNeeded, setPaydownNeeded] = useState(0)
  const [sourcesAboveThreshold, setSourcesAboveThreshold] = useState(0)
  const [chartData, setChartData] = useState<any | null>(null)

  function calculatePaydownNeeded(currentSources: { source: string; balance: number }[], currentThreshold: number) {
    const above = currentSources.filter((s) => typeof s.balance === 'number' && s.balance > currentThreshold)
    const paydown = above.reduce((sum, s) => sum + (Number(s.balance) - currentThreshold), 0)
    setPaydownNeeded(paydown)
    setSourcesAboveThreshold(above.length)
  }

  function generateChartData(currentSources: { source: string; balance: number }[], currentThreshold: number) {
    const labels = currentSources.map((item) => item.source)
    const utilization = currentSources.map((item) => {
      if (!currentThreshold || currentThreshold <= 0) return 0
      const pct = (Number(item.balance) / currentThreshold) * 100
      return Math.round(pct)
    })

    return {
      labels,
      datasets: [
        {
          label: "Utilization (%)",
          data: utilization,
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
        {
          type: "line" as const,
          label: "Threshold (100%)",
          data: Array(labels.length).fill(100),
          borderColor: "rgba(255, 0, 0, 0.8)",
          backgroundColor: "rgba(255, 0, 0, 0.1)",
          borderWidth: 2,
          pointRadius: 0,
        },
      ],
    }
  }

  // Validate data before rendering (computed early so hooks can run above returns)
  const validSources = sources.filter(source => 
    source.source && typeof source.balance === 'number'
  )

  // Debug: Validate data structure
  useEffect(() => {
    console.log('[DEBUG] PaymentSourceBalances: Data validation:', {
      sourcesLength: sources.length,
      sourcesData: sources,
      hasValidData: sources.length > 0 && sources.every(source => 
        source.source && typeof source.balance === 'number'
      )
    })
  }, [sources])

  // Debug: Verify Chart.js registration
  useEffect(() => {
    console.log('[DEBUG] PaymentSourceBalances: Chart.js registered components:', {
      registry: ChartJS.registry,
      plugins: ChartJS.registry.plugins?.items || 'No plugins found',
      scales: ChartJS.registry.scales?.items || 'No scales found'
    })
  }, [])

  // Debug: Log every time the component renders
  console.log('[DEBUG] PaymentSourceBalances: Render triggered with:', {
    sources,
    loading,
    error,
    sourcesLength: sources?.length || 0,
    useTestData
  })

  // Calculate KPIs and chart data when sources or threshold change
  useEffect(() => {
    const currentValid = sources.filter(source => 
      source.source && typeof source.balance === 'number'
    )
    calculatePaydownNeeded(currentValid, threshold)
    const data = generateChartData(currentValid, threshold)
    setChartData(data)
    console.log('[DEBUG] PaymentSourceBalances: Chart data prepared (utilization):', data)
  }, [sources, threshold])

  // Temporary test data to verify Chart.js works
  const testData = {
    labels: ['Test Account 1', 'Test Account 2', 'Test Account 3'],
    datasets: [{
      label: 'Test Balance',
      data: [1000, 1500, 800],
      backgroundColor: [
        "rgba(255, 99, 132, 0.8)",
        "rgba(54, 162, 235, 0.8)",
        "rgba(255, 205, 86, 0.8)",
      ],
      borderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 205, 86, 1)",
      ],
      borderWidth: 1,
    }]
  }

  if (loading) {
    console.log('[DEBUG] PaymentSourceBalances: Showing loading state')
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-gray-500">Loading chart data...</div>
      </div>
    )
  }

  if (error) {
    console.log('[DEBUG] PaymentSourceBalances: Showing error state:', error)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-red-500">Error: {error}</div>
      </div>
    )
  }

  if (!sources || sources.length === 0) {
    console.log('[DEBUG] PaymentSourceBalances: Showing no data state - sources:', sources)
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
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Balance Threshold: ${threshold}</label>
              <Slider value={[threshold]} onValueChange={(v) => setThreshold(v[0] ?? 0)} max={3000} min={0} step={50} className="w-full" />
            </div>
            <div style={{ position: 'relative', height: '400px', width: '100%' }}>
              <Bar data={testData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "top" as const },
                  title: { display: true, text: "Test Chart - Payment Source Balances" },
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
          </div>
        )}
      </div>
    )
  }

  if (validSources.length === 0) {
    console.log('[DEBUG] PaymentSourceBalances: No valid source data found')
    return (
      <div className="w-full h-full p-4 space-y-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setUseTestData(!useTestData)}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {useTestData ? 'Hide Test Data' : 'Show Test Data'}
          </button>
          <span className="text-sm text-gray-600">No valid payment source data found</span>
        </div>
        {useTestData && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Balance Threshold: ${threshold}</label>
              <Slider value={[threshold]} onValueChange={(v) => setThreshold(v[0] ?? 0)} max={3000} min={0} step={50} className="w-full" />
            </div>
            <div style={{ position: 'relative', height: '400px', width: '100%' }}>
              <Bar data={testData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "top" as const },
                  title: { display: true, text: "Test Chart - Payment Source Balances" },
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
          </div>
        )}
      </div>
    )
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Payment Source Utilization",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return value + "%"
          },
        },
      },
    },
  }

  console.log('[DEBUG] PaymentSourceBalances: About to render chart with data:', chartData)

  return (
    <div className="w-full h-full p-4 space-y-6">
      {/* Balance Description and Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            {BALANCE_DESCRIPTIONS.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            {BALANCE_DESCRIPTIONS.description}
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Key Features */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Key Features
              </h4>
              <ul className="space-y-2 text-sm">
                {BALANCE_DESCRIPTIONS.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Balance Statistics */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" />
                Balance Statistics
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="text-lg font-bold text-blue-600">
                    {validSources.length}
                  </div>
                  <div className="text-xs text-gray-500">Accounts</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="text-lg font-bold text-green-600">
                    ${validSources.reduce((sum, source) => sum + Number(source.balance), 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Total Balance</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart Controls and Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Balance Visualization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Minimum Balance Threshold: ${threshold}</label>
            <Slider value={[threshold]} onValueChange={(v) => setThreshold(v[0] ?? 0)} max={3000} min={0} step={50} className="w-full" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="text-lg font-bold text-amber-600">
                ${paydownNeeded.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Paydown Needed</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="text-lg font-bold text-purple-600">
                {sourcesAboveThreshold}
              </div>
              <div className="text-xs text-gray-500">Sources Above Threshold</div>
            </div>
          </div>
          <div className="flex-1" style={{ position: 'relative', height: '400px', width: '100%' }}>
            {chartData && <Bar data={chartData} options={options} />}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
