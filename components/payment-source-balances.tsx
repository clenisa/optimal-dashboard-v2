"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFinancialData } from "@/hooks/useFinancialData"
import { UI_CONSTANTS } from '@/lib/constants'
import { CONTENT } from '@/lib/content'
import { logger } from '@/lib/logger'

import { PaymentSourceChart } from './payment-source/chart'
import { KpiDisplay } from './payment-source/kpi-display'
import { ThresholdControl } from './payment-source/threshold-control'
import type { PaymentSource, KpiData } from './payment-source/types'
import { CreditUtilization } from "./credit-utilization"
import { ApiDisplay } from "./payment-source/api-display"

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

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <Tabs defaultValue="balances" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="balances">Account Balances</TabsTrigger>
          <TabsTrigger value="utilization">Credit Utilization</TabsTrigger>
        </TabsList>
        
        <TabsContent value="balances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Source Balances</CardTitle>
              <CardDescription>
                {CONTENT.paymentSourceBalances.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThresholdControl 
                threshold={threshold} 
                onThresholdChange={(value: number) => setThreshold(value)}
                useTestData={useTestData}
                onToggleTestData={() => setUseTestData(!useTestData)}
              />
              <KpiDisplay kpiData={kpiData} threshold={threshold} />
              <PaymentSourceChart 
                sources={(useTestData ? TEST_SOURCES : (sources as PaymentSource[]) || [])} 
                threshold={threshold}
              />
              <ApiDisplay sources={(useTestData ? TEST_SOURCES : (sources as PaymentSource[]) || [])} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="utilization">
          <CreditUtilization />
        </TabsContent>
        
      </Tabs>
    </div>
  )
}

