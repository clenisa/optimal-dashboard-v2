"use client"

import { TransactionData } from "@/lib/chart-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrencyDisplay } from "@/lib/currency-utils"

interface TransactionSummaryProps {
  transactions: TransactionData[]
}

export function TransactionSummary({ transactions }: TransactionSummaryProps) {
  const hasType = transactions.some(t => typeof (t as any).type === 'string')

  const totalIncome = hasType
    ? transactions
        .filter((t) => (t as any).type === 'income')
        .reduce((acc, t) => acc + t.amount, 0)
    : transactions
        .filter((t) => t.amount > 0)
        .reduce((acc, t) => acc + t.amount, 0)

  const totalExpenses = hasType
    ? transactions
        .filter((t) => (t as any).type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0)
    : transactions
        .filter((t) => t.amount < 0)
        .reduce((acc, t) => acc + Math.abs(t.amount), 0)

  const netBalance = hasType
    ? totalIncome - totalExpenses
    : totalIncome - totalExpenses

  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Income:</span>
            <span className="text-green-500">{formatCurrencyDisplay(totalIncome)}</span>
          </div>
          <div className="flex justify-between">
            <span>Expenses:</span>
            <span className="text-red-500">{formatCurrencyDisplay(totalExpenses)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Balance:</span>
            <span className={netBalance >= 0 ? 'text-green-500' : 'text-red-500'}>{formatCurrencyDisplay(netBalance)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


