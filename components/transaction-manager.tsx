"use client"

import { useEffect, useMemo, useState } from 'react'
import { useAuthState } from '@/hooks/use-auth-state'
import { useFinancialData } from '@/hooks/useFinancialData'
import { TransactionData } from '@/lib/chart-data'
import { TransactionTable } from '@/components/transaction-table'
import { TransactionFilters } from '@/components/transaction-filters'
import { TransactionSummary } from '@/components/transaction-summary'
import AutoCategorizeButton from '@/components/transactions/AutoCategorizeButton'

const statusContainerClass =
  'rounded-lg border border-border/60 bg-muted/40 p-6 text-center text-sm text-muted-foreground'

export function TransactionManager() {
  const { user } = useAuthState()
  const { transactions, loading, error } = useFinancialData()
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionData[]>([])

  useEffect(() => {
    setFilteredTransactions(transactions)
  }, [transactions])

  const statusState = useMemo(() => {
    if (!user) {
      return { message: 'Please log in to view your transactions.', tone: 'neutral' as const }
    }

    if (loading) {
      return { message: 'Loading transactions...', tone: 'neutral' as const }
    }

    if (error) {
      return { message: error, tone: 'error' as const }
    }

    return null
  }, [error, loading, user])

  if (statusState) {
    return (
      <div className={statusContainerClass}>
        <p className={statusState.tone === 'error' ? 'text-destructive' : undefined}>{statusState.message}</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden p-4 sm:p-6">
      <div className="flex flex-col gap-3 rounded-lg border border-border/60 bg-card/80 px-4 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/70 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-base font-semibold tracking-tight sm:text-lg">Transactions</h1>
        <AutoCategorizeButton
          onDone={() => {
            window.location.reload()
          }}
        />
      </div>

      <div className="rounded-lg border border-border/60 bg-card/80 p-4">
        <TransactionSummary transactions={filteredTransactions} />
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-hidden">
        <div className="rounded-lg border border-border/60 bg-card/80 p-3">
          <TransactionFilters
            allTransactions={transactions}
            setFilteredTransactions={setFilteredTransactions}
          />
        </div>

        <div className="flex-1 overflow-hidden rounded-lg border border-border/60 bg-card/90">
          <div className="h-full overflow-auto">
            {filteredTransactions.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {transactions.length === 0
                    ? 'No transactions found yet. Connect an account or upload data to get started.'
                    : 'No transactions match your filters. Try adjusting the date range or clearing filters.'}
                </p>
              </div>
            ) : (
              <TransactionTable
                transactions={filteredTransactions}
                onTransactionUpdated={(updated) => {
                  setFilteredTransactions((prev) =>
                    prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)),
                  )
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


