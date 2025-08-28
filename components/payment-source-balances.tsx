"use client"

import { useEffect, useState } from "react"
import { Bar } from "react-chartjs-2"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { useFinancialData } from "@/hooks/useFinancialData"

export function PaymentSourceBalances() {
  const { sources, loading, error } = useFinancialData()
  const [threshold, setThreshold] = useState(500) // Dollar threshold for now
  const [useTestData, setUseTestData] = useState(false)

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
  if (validSources.length === 0) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>Balance Visualization</CardTitle>
          <CardDescription>No payment source data available</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <button
            onClick={() => setUseTestData(!useTestData)}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {useTestData ? 'Hide Test Data' : 'Show Test Data'}
          </button>
          
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
                  labels: ['Chase 7245', 'Discover', 'BestBuy'],
                  datasets: [{
                    label: 'Balance ($)',
                    data: [2500, 1200, 800],
                    backgroundColor: [
                      'rgba(255, 99, 132, 0.8)',
                      'rgba(54, 162, 235, 0.8)',
                      'rgba(255, 205, 86, 0.8)',
                    ],
                    borderColor: [
                      'rgba(255, 99, 132, 1)',
                      'rgba(54, 162, 235, 1)',
                      'rgba(255, 205, 86, 1)',
                    ],
                    borderWidth: 1,
                  }],
                }} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    title: {
                      display: true,
                      text: "Test Data - Payment Source Balances",
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
        </CardContent>
      </Card>
    )
  }

  // Filter sources above threshold
  const filteredSources = validSources.filter(source => source.balance >= threshold)

  // Prepare chart data
  const chartData = {
    labels: filteredSources.map(source => source.source),
    datasets: [{
      label: 'Balance ($)',
      data: filteredSources.map(source => source.balance),
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 205, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(199, 199, 199, 0.8)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 205, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(199, 199, 199, 1)',
      ],
      borderWidth: 1,
    }],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
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
        
        <div className="text-sm text-gray-600">
          Showing {filteredSources.length} of {validSources.length} payment sources above ${threshold}
        </div>

        {filteredSources.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-sm text-gray-500">No payment sources above ${threshold} threshold</div>
          </div>
        ) : (
          <div style={{ position: 'relative', height: '400px', width: '100%' }}>
            <Bar data={chartData} options={options} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

