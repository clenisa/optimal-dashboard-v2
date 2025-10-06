"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { CombinedResult } from '@/lib/csv/types'

interface ResultSummaryProps {
  result: CombinedResult | null
  loading: boolean
  onDownload: () => void
}

export function CombinerResultSummary({ result, loading, onDownload }: ResultSummaryProps) {
  if (!result) return null

  const { summary } = result

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Combined Summary</CardTitle>
        <Button onClick={onDownload} disabled={loading} variant="outline">
          Download CSV
        </Button>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <Stat label="Files" value={summary.totalFiles} />
        <Stat label="Transactions" value={summary.totalTransactions} />
        <Stat label="Duplicates Removed" value={summary.duplicatesRemoved} />
        <Stat label="Processing Time" value={`${summary.processingTime}ms`} />
      </CardContent>
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="space-y-1">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
    </div>
  )
}
