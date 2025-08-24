"use client"

import { TransactionData } from "@/lib/chart-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TransactionSummaryProps {
  transactions: TransactionData[]
}

export function TransactionSummary({ transactions }: TransactionSummaryProps) {
  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0)

  const totalExpenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((acc, t) => acc + t.amount, 0)

  const netBalance = totalIncome + totalExpenses

  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Income:</span>
            <span className="text-green-500">{totalIncome.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Expenses:</span>
            <span className="text-red-500">{totalExpenses.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Balance:</span>
            <span>{netBalance.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


