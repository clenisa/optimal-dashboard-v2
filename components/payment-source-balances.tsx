"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useFinancialData } from "@/hooks/useFinancialData"
import { UI_CONSTANTS } from '@/lib/constants'
import { CONTENT } from '@/lib/content'
import { logger } from '@/lib/logger'

import { PaymentSourceChart } from './payment-source/chart'
import { KpiDisplay } from './payment-source/kpi-display'
import { ThresholdControl } from './payment-source/threshold-control'
import type { PaymentSource, KpiData } from './payment-source/types'

const TEST_SOURCES: PaymentSource[] = [
  { source: "Chase 7245", balance: 2500, max_balance: 5000, type: "credit" },
  { source: "Discover", balance: 1200, max_balance: 3000, type: "credit" },
  { source: "BestBuy", balance: 800, max_balance: 1500, type: "credit" },
  { source: "Synchrony", balance: 1800, max_balance: 2000, type: "credit" },
  { source: "CreditOne", balance: 450, max_balance: 1000, type: "credit" },
]

export function PaymentSourceBalances() {
  const { sources, loading, error } = useFinancialData()
  const [threshold, setThreshold] = useState<number>(UI_CONSTANTS.DEFAULT_THRESHOLD_PERCENTAGE)
  const [useTestData, setUseTestData] = useState(false)
  const [kpiData, setKpiData] = useState<KpiData>({ 
    paydownNeeded: 0, 
    sourcesAboveThreshold: 0, 
    totalSources: 0 
  })

  const calculateKpis = (sources: PaymentSource[], thresholdPercent: number): KpiData => {
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

    return {
      paydownNeeded: totalPaydown,
      sourcesAboveThreshold: aboveThresholdCount,
      totalSources: sources.length
    }
  }

  useEffect(() => {
    const sourcesToUse = useTestData ? TEST_SOURCES : (sources as PaymentSource[]) || []
    const newKpiData = calculateKpis(sourcesToUse, threshold)
    setKpiData(newKpiData)
    
    logger.debug('PaymentSourceBalances', 'KPIs calculated', {
      threshold,
      useTestData,
      sourcesCount: sourcesToUse.length,
      kpiData: newKpiData
    })
  }, [sources, threshold, useTestData])

  useEffect(() => {
    logger.debug('PaymentSourceBalances', 'Data received', { 
      sourcesCount: sources?.length || 0, 
      loading, 
      error: error ? error.toString() : null
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
          <div className="text-sm text-red-500">Error: {error}</div>
        </CardContent>
      </Card>
    )
  }

  const sourcesToDisplay = useTestData ? TEST_SOURCES : (sources as PaymentSource[]) || []

  return (
    <div className="w-full h-full p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{CONTENT.paymentSourceBalances.title}</CardTitle>
          <CardDescription>{CONTENT.paymentSourceBalances.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ThresholdControl
            threshold={threshold}
            onThresholdChange={(value: number) => setThreshold(value)}
            useTestData={useTestData}
            onToggleTestData={() => setUseTestData(!useTestData)}
          />
          
          <KpiDisplay kpiData={kpiData} threshold={threshold} />
          
          <PaymentSourceChart sources={sourcesToDisplay} threshold={threshold} />
        </CardContent>
      </Card>
    </div>
  )
}

