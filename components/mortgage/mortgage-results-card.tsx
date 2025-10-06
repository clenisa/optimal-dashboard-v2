"use client"

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { MortgageResult } from '@/lib/mortgage/types'
import { formatCurrency } from '@/lib/mortgage/utils'

interface MortgageResultsCardProps {
  result: MortgageResult | null
  error: string | null
}

export function MortgageResultsCard({ result, error }: MortgageResultsCardProps) {
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!result) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <ResultStat label="Monthly Payment" value={formatCurrency(result.monthlyPayment)} />
          <ResultStat label="Loan Amount" value={formatCurrency(result.loanAmount)} />
          <ResultStat label="Total Interest" value={formatCurrency(result.totalInterest)} />
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <BreakdownCard title="Monthly Breakdown" total={result.monthlyBreakdown.totalMonthlyPayment}>
            {renderBreakdown(result.monthlyBreakdown)}
          </BreakdownCard>
          <BreakdownCard title="Annual Breakdown" total={result.annualBreakdown.totalAnnualPayment}>
            {renderBreakdown(result.annualBreakdown)}
          </BreakdownCard>
        </div>
      </CardContent>
    </Card>
  )
}

function ResultStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4 text-center">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}

function BreakdownCard({ title, total, children }: { title: string; total: number; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="rounded-lg border">
        <div className="flex items-center justify-between border-b p-3 text-sm">
          <span className="font-medium">Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <div className="space-y-2 p-3 text-sm text-muted-foreground">{children}</div>
      </div>
    </div>
  )
}

function renderBreakdown(breakdown: MortgageResult['monthlyBreakdown']) {
  const entries: Array<[string, number]> = [
    ['Principal & Interest', breakdown.principalAndInterest],
    ['Property Tax', breakdown.propertyTax],
    ['Home Insurance', breakdown.homeInsurance],
    ['PMI Insurance', breakdown.pmiInsurance],
    ['HOA Fee', breakdown.hoaFee],
    ['Other Costs', breakdown.otherCosts],
  ]

  return entries
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([label, value]) => (
      <div key={label} className="flex items-center justify-between">
        <span>{label}</span>
        <span>{formatCurrency(value)}</span>
      </div>
    ))
}
