"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { ParsedTransaction } from '@/lib/csv-parser'
import { formatCurrencyDisplay } from '@/lib/currency-utils'

interface TransactionsPreviewProps {
  transactions: ParsedTransaction[]
}

export function TransactionsPreview({ transactions }: TransactionsPreviewProps) {
  if (transactions.length === 0) return null

  const preview = transactions.slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Parsed Transactions ({transactions.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 w-full">
          <div className="space-y-2">
            {preview.map((txn, index) => (
              <div key={`${txn.date}-${txn.description}-${index}`} className="border rounded p-2 text-sm">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Field label="Date" value={txn.date} />
                  <Field label="Amount" value={formatCurrencyDisplay(txn.amount)} />
                  <Field label="Type" value={txn.type || 'N/A'} />
                  <Field label="Category" value={txn.category || 'N/A'} />
                </div>
                <div className="mt-1">
                  <span className="font-medium">Description:</span> {txn.description}
                </div>
              </div>
            ))}
            {transactions.length > preview.length && (
              <div className="text-center text-sm text-gray-500 py-2">
                Showing first {preview.length} of {transactions.length} transactions
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="font-medium">{label}:</span> {value}
    </div>
  )
}
