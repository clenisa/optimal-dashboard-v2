"use client"

import { useEffect, useState } from "react"
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
  Legend,
} from "chart.js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { useFinancialData } from "@/hooks/useFinancialData"

// Extended interface for sources with credit limit data
interface PaymentSource {
  source: string;
  balance: number;
  max_balance?: number; // Credit limit for credit accounts
  type?: 'credit' | 'debit';
}

export function PaymentSourceBalances() {
  // Ensure Chart.js elements are registered (needed for react-chartjs-2)
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

  const { sources, loading, error } = useFinancialData()
  const [threshold, setThreshold] = useState(30) // Percentage threshold (30%)
  const [useTestData, setUseTestData] = useState(false)
  const [paydownNeeded, setPaydownNeeded] = useState(0)
  const [sourcesAboveThreshold, setSourcesAboveThreshold] = useState(0)

  // Calculate paydown needed (legacy updateWarningKPI logic)
  const calculatePaydownNeeded = (sources: PaymentSource[], thresholdPercent: number) => {
    let totalPaydown = 0
    let aboveThresholdCount = 0

    sources.forEach(source => {
      if (source.type === 'credit' && source.max_balance && source.balance) {
        const targetBalance = source.max_balance * (thresholdPercent / 100)
        const paydown = Math.max(0, source.balance - targetBalance)
        if (paydown > 0) {
          totalPaydown += paydown
          aboveThresholdCount++
        }
      }
    })

    setPaydownNeeded(totalPaydown)
    setSourcesAboveThreshold(aboveThresholdCount)
  }

  // Generate chart data with utilization percentages (legacy generateSourceBalanceData logic)
  const generateChartData = (sources: PaymentSource[]) => {
    const labels = sources.map(source => source.source)
    const utilization = sources.map(source => {
      if (source.type === 'credit' && source.max_balance && source.max_balance > 0) {
        return Math.round((source.balance / source.max_balance) * 100)
      }
      return 0 // Non-credit accounts or accounts without max_balance
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
          label: "Threshold (" + threshold + "%)",
          data: Array(labels.length).fill(threshold),
          borderColor: "rgba(255, 0, 0, 0.8)",
          backgroundColor: "rgba(255, 0, 0, 0.1)",
          borderWidth: 2,
          pointRadius: 0,
        },
      ],
    }
  }

  // Test data with credit limits for demonstration
  const testSources: PaymentSource[] = [
    { source: "Chase 7245", balance: 2500, max_balance: 5000, type: "credit" },
    { source: "Discover", balance: 1200, max_balance: 3000, type: "credit" },
    { source: "BestBuy", balance: 800, max_balance: 1500, type: "credit" },
    { source: "Synchrony", balance: 1800, max_balance: 2000, type: "credit" },
    { source: "CreditOne", balance: 450, max_balance: 1000, type: "credit" },
  ]

  // Calculate KPIs when data changes
  useEffect(() => {
    const sourcesToUse = useTestData ? testSources : (sources as PaymentSource[]) || []
    calculatePaydownNeeded(sourcesToUse, threshold)
  }, [sources, threshold, useTestData])

  // Debug logging
  useEffect(() => {
    console.log('[DEBUG] PaymentSourceBalances: Data received:', {
      sourcesCount: sources?.length || 0,
      sources: sources,
      loading,
      error
    })
  }, [sources, loading, error])

  if (loading) {
    return (
      <Card className="w-full h-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-sm text-gray-500">Loading payment sources...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full h-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-sm text-red-500">Error loading data: {error}</div>
        </CardContent>
      </Card>
    )
  }

  // Filter valid sources
  const validSources = sources?.filter(source => 
    source.source && typeof source.balance === 'number'
  ) || []

  // Show test data option if no real data
  const hasRealData = validSources.length > 0

  if (!hasRealData) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>Balance Visualization</CardTitle>
          <CardDescription>
            Monitor your account balances across different payment sources and financial institutions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <button
            onClick={() => setUseTestData(!useTestData)}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {useTestData ? 'Hide Test Data' : 'Show Test Data'}
          </button>
          
          {!useTestData && (
            <div className="text-sm text-gray-500">
              Real data available but no credit limits. Enable test data to see percentage calculations.
            </div>
          )}
          
          {useTestData && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Warning Threshold: {threshold}%</label>
                <Slider 
                  value={[threshold]} 
                  onValueChange={(v) => setThreshold(v[0] ?? 30)} 
                  max={100} 
                  min={0} 
                  step={5} 
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

              <div style={{ position: 'relative', height: '400px', width: '100%' }}>
                <Bar data={generateChartData(testSources)} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    title: {
                      display: true,
                      text: "Payment Source Utilization",
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 120, // Show up to 120% to accommodate threshold line
                      ticks: {
                        callback: function(value: any) {
                          return value + "%"
                        },
                      },
                    },
                  },
                }} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // We have real credit data - render the actual chart
  const chartData = generateChartData(sources as PaymentSource[])
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "Payment Source Utilization",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 120,
        ticks: {
          callback: function(value: any) {
            return value + "%"
          },
        },
      },
    },
  }

  // If we have real data but no credit limits, show basic dollar chart
  if (validSources.length > 0) {
    const basicChartData = {
      labels: validSources.map(source => source.source),
      datasets: [{
        label: 'Balance ($)',
        data: validSources.map(source => source.balance),
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
      }],
    }

    const basicOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Payment Source Balances (Dollar Amounts)",
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
          <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded">
            Showing {validSources.length} payment sources. Add credit limits to enable percentage calculations.
          </div>
          
          <button
            onClick={() => setUseTestData(!useTestData)}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {useTestData ? 'Show Real Data' : 'Show Test Data with Percentages'}
          </button>

          {useTestData ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Warning Threshold: {threshold}%</label>
                <Slider 
                  value={[threshold]} 
                  onValueChange={(v) => setThreshold(v[0] ?? 30)} 
                  max={100} 
                  min={0} 
                  step={5} 
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

              <div style={{ position: 'relative', height: '400px', width: '100%' }}>
                <Bar data={generateChartData(testSources)} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    title: {
                      display: true,
                      text: "Payment Source Utilization (Test Data)",
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 120,
                      ticks: {
                        callback: function(value: any) {
                          return value + "%"
                        },
                      },
                    },
                  },
                }} />
              </div>
            </div>
          ) : (
            <div style={{ position: 'relative', height: '400px', width: '100%' }}>
              <Bar data={basicChartData} options={basicOptions} />
            </div>
          )}
        </CardContent>
      </Card>
    )
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
          <label className="text-sm font-medium">Warning Threshold: {threshold}%</label>
          <Slider 
            value={[threshold]} 
            onValueChange={(v) => setThreshold(v[0] ?? 30)} 
            max={100} 
            min={0} 
            step={5} 
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

        <div style={{ position: 'relative', height: '400px', width: '100%' }}>
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}

