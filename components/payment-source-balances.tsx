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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
  const [threshold, setThreshold] = useState(30) // PERCENTAGE, not dollar amount
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
      return Number(item.balance)
    })

    return {
      labels,
      datasets: [
        {
          label: "Balance ($)",
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
      ],
    }
  }

  // Calculate KPIs and chart data when sources or threshold change
  useEffect(() => {
    if (sources && sources.length > 0) {
      const currentValid = sources.filter(source =>
        source.source && typeof source.balance === 'number'
      )
      if (currentValid.length > 0) {
        calculatePaydownNeeded(currentValid, threshold)
        const data = generateChartData(currentValid, threshold)
        setChartData(data)
        console.log('[DEBUG] PaymentSourceBalances: Chart data prepared:', data)
      }
    }
  }, [sources, threshold])

  // Debug: Validate data structure
  useEffect(() => {
    console.log('[DEBUG] PaymentSourceBalances: Data validation:', {
      sourcesLength: sources?.length || 0,
      sources,
      hasValidData: sources && sources.length > 0 && sources.every(source => 
        source.source && typeof source.balance === 'number'
      )
    })
  }, [sources])

  if (loading) {
    return (
      <div className="w-full h-full p-4 space-y-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-sm text-gray-500">Loading chart data...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full p-4 space-y-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-sm text-red-500">Error: {error}</div>
        </div>
      </div>
    )
  }

  // Show test data option if no real data
  if (!sources || sources.length === 0) {
    return (
      <div className="w-full h-full p-4 space-y-4">
        <button
          onClick={() => setUseTestData(!useTestData)}
          className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {useTestData ? 'Hide Test Data' : 'Show Test Data'}
        </button>
        {!useTestData && <div className="text-sm text-gray-500">No real data available</div>}
        
        {useTestData && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Balance Threshold: ${threshold}</label>
              <Slider 
                value={[threshold]} 
                onValueChange={(v) => setThreshold(v[0] ?? 500)} 
                max={3000} 
                min={0} 
                step={50} 
                className="w-full" 
              />
            </div>
            <div style={{ position: 'relative', height: '400px', width: '100%' }}>
              <Bar data={{
                labels: ['Test Account 1', 'Test Account 2', 'Test Account 3'],
                datasets: [{
                  label: 'Test Balance',
                  data: [1000, 1500, 800],
                  backgroundColor: 'rgba(255, 99, 132, 0.8)',
                  borderColor: 'rgba(255, 99, 132, 1)',
                  borderWidth: 1,
                }],
              }} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  title: {
                    display: true,
                    text: "Test Chart - Payment Source Balances",
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
              }} />
            </div>
          </div>
        )}
      </div>
    )
  }

  // We have real data - render the chart
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
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
          callback: function(value: any) {
            return "$" + value.toLocaleString()
          },
        },
      },
    },
  }

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Balance Visualization</CardTitle>
        <CardDescription>
          Monitor your account balances across different payment sources and financial institutions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Minimum Balance Threshold: ${threshold}</label>
          <Slider 
            value={[threshold]} 
            onValueChange={(v) => setThreshold(v[0] ?? 500)} 
            max={3000} 
            min={0} 
            step={50} 
            className="w-full" 
          />
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
  )
}
