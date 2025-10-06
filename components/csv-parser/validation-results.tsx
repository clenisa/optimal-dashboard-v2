"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { BatchValidationResult } from '@/lib/csv/transaction-validation'
import type { ProcessingStats } from '@/lib/csv/types'

interface ValidationResultsProps {
  validation: BatchValidationResult
  processingStats: ProcessingStats | null
}

export function ValidationResults({ validation, processingStats }: ValidationResultsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Validation Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryStat label="Valid" value={validation.processedCount} tone="text-green-600" />
          <SummaryStat label="Invalid" value={validation.skippedCount} tone="text-red-600" />
          <SummaryStat label="Warnings" value={validation.warnings.length} tone="text-yellow-600" />
          <SummaryStat
            label="Processing Time"
            value={`${processingStats?.processingTime ?? 0}ms`}
            tone="text-blue-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={validation.isValid ? 'default' : 'destructive'}>
            {validation.isValid ? 'Valid' : 'Invalid'}
          </Badge>
          {validation.warnings.length > 0 && (
            <Badge variant="secondary">{validation.warnings.length} Warning(s)</Badge>
          )}
        </div>

        {validation.errors.length > 0 && (
          <Section title="Validation Errors" tone="text-red-600">
            {validation.errors.map((error, index) => (
              <div key={index} className="text-sm text-red-600">
                {error}
              </div>
            ))}
          </Section>
        )}

        {validation.warnings.length > 0 && (
          <Section title="Warnings" tone="text-yellow-600">
            {validation.warnings.map((warning, index) => (
              <div key={index} className="text-sm text-yellow-600">
                {warning}
              </div>
            ))}
          </Section>
        )}
      </CardContent>
    </Card>
  )
}

function SummaryStat({ label, value, tone }: { label: string; value: number | string; tone: string }) {
  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${tone}`}>{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}

function Section({
  title,
  tone,
  children,
}: {
  title: string
  tone: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <h4 className={`font-medium ${tone}`}>{title}</h4>
      <ScrollArea className="h-32 w-full border rounded p-2">
        <div className="space-y-1">{children}</div>
      </ScrollArea>
    </div>
  )
}
