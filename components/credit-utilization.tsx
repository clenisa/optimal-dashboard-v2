"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase-client"
import { CreditCard, AlertTriangle, CheckCircle } from "lucide-react"

interface CreditSource {
  id: number
  name: string
  current_balance: number
  max_balance: number
  interest_rate: number
}

export function CreditUtilization() {
  const [creditSources, setCreditSources] = useState<CreditSource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCreditSources()
  }, [])

  const fetchCreditSources = async () => {
    setLoading(true)
    const supabase = createClient()
    if (!supabase) {
      setCreditSources([])
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("sources")
      .select("id,name,current_balance,max_balance,interest_rate,type")
      .eq("type", "credit")
      .order("name")

    if (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching credit sources:", error)
      setCreditSources([])
    } else {
      setCreditSources((data as any) || [])
    }
    setLoading(false)
  }

  const calculateUtilization = (current: number, max: number): number => {
    return max > 0 ? (current / max) * 100 : 0
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getUtilizationColor = (utilization: number): string => {
    if (utilization >= 90) return "bg-red-500"
    if (utilization >= 70) return "bg-yellow-500"
    if (utilization >= 30) return "bg-blue-500"
    return "bg-green-500"
  }

  const getUtilizationIcon = (utilization: number) => {
    if (utilization >= 90) return <AlertTriangle className="h-5 w-5 text-red-500" />
    if (utilization >= 70) return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    return <CheckCircle className="h-5 w-5 text-green-500" />
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Credit Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            Loading credit utilization...
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalUtilization = creditSources.length > 0
    ? creditSources.reduce<number>((sum: number, source: CreditSource) => {
        return sum + calculateUtilization(source.current_balance, source.max_balance)
      }, 0) / creditSources.length
    : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Credit Utilization Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {creditSources.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No credit cards found. Add credit cards in the Payment Sources tab.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Overall Credit Utilization</span>
                <span className="text-sm font-mono">{totalUtilization.toFixed(1)}%</span>
              </div>
              <Progress 
                value={totalUtilization} 
                className="h-3"
                indicatorClassName={getUtilizationColor(totalUtilization)}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Recommended to keep below 30% for optimal credit score
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Individual Card Utilization</h3>
              {creditSources.map((source: CreditSource) => {
                const utilization = calculateUtilization(source.current_balance, source.max_balance)
                const available = source.max_balance - source.current_balance
                
                return (
                  <div key={source.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getUtilizationIcon(utilization)}
                        <span className="font-medium">{source.name}</span>
                      </div>
                      <span className="text-sm font-mono">{utilization.toFixed(1)}%</span>
                    </div>
                    
                    <Progress 
                      value={utilization} 
                      className="h-2 mb-3"
                      indicatorClassName={getUtilizationColor(utilization)}
                    />
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Current Balance:</span>
                        <div className="font-mono">{formatCurrency(source.current_balance)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Available Credit:</span>
                        <div className="font-mono text-green-600">{formatCurrency(available)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Credit Limit:</span>
                        <div className="font-mono">{formatCurrency(source.max_balance)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Interest Rate:</span>
                        <div className="font-mono">{(source.interest_rate || 0).toFixed(2)}%</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

