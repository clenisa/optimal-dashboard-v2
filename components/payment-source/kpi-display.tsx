import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, TrendingUp, Wallet } from "lucide-react"
import type { KpiDisplayProps } from './types'

export function KpiDisplay({ kpiData, threshold }: KpiDisplayProps) {
  const { paydownNeeded, sourcesAboveThreshold, totalSources } = kpiData

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusVariant = () => {
    if (sourcesAboveThreshold === 0) return "default"
    if (sourcesAboveThreshold <= totalSources / 2) return "secondary"
    return "destructive"
  }

  const getStatusText = () => {
    if (sourcesAboveThreshold === 0) return "On Track"
    if (sourcesAboveThreshold <= totalSources / 2) return "Monitor"
    return "Action Needed"
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Paydown Needed</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(paydownNeeded)}</div>
          <p className="text-xs text-muted-foreground">
            To reach {threshold}% utilization
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Above Threshold</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{sourcesAboveThreshold}</div>
          <p className="text-xs text-muted-foreground">
            of {totalSources} sources
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Badge variant={getStatusVariant()}>
            {getStatusText()}
          </Badge>
          <p className="text-xs text-muted-foreground mt-2">
            {sourcesAboveThreshold > 0 
              ? `${sourcesAboveThreshold} account${sourcesAboveThreshold > 1 ? 's' : ''} need attention`
              : 'All accounts within target'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

