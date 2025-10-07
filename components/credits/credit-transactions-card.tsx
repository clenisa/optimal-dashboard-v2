"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CreditTransaction } from '@/lib/credits/types'
import { formatCreditTimestamp, getTransactionColor, getTransactionIcon } from '@/lib/credits/utils'
import { History } from 'lucide-react'

interface CreditTransactionsCardProps {
  transactions: CreditTransaction[]
}

export function CreditTransactionsCard({ transactions }: CreditTransactionsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <History className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card/80 p-3 transition-colors hover:border-primary/40"
              >
                <div className="flex items-center gap-3">
                  {getTransactionIcon(transaction.type)}
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCreditTimestamp(transaction.created_at)}
                    </div>
                  </div>
                </div>
                <div className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
