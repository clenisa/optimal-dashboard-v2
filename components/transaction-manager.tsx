"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuthState } from '@/hooks/use-auth-state'
import { useFinancialData } from '@/hooks/useFinancialData'
import { TransactionData } from '@/lib/chart-data'
import { TransactionTable } from '@/components/transaction-table'
import { TransactionFilters } from '@/components/transaction-filters'
import { TransactionSummary } from '@/components/transaction-summary'
import AutoCategorizeButton from '@/components/transactions/AutoCategorizeButton'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const statusContainerClass =
  'rounded-lg border border-border/60 bg-muted/40 p-6 text-center text-sm text-muted-foreground'

export function TransactionManager() {
  const { user } = useAuthState()
  const { transactions, loading, error } = useFinancialData()
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionData[]>([])
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(50)

  useEffect(() => {
    setFilteredTransactions(transactions)
  }, [transactions])

  const handleFilteredChange = useCallback((nextTransactions: TransactionData[]) => {
    setFilteredTransactions(nextTransactions)
    setPage(0)
  }, [])

  const totalItems = filteredTransactions.length
  const rawPageCount = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize)
  const pageCount = Math.max(1, rawPageCount)

  useEffect(() => {
    if (page >= pageCount) {
      setPage(Math.max(0, pageCount - 1))
    }
  }, [page, pageCount])

  const paginatedTransactions = useMemo(() => {
    const start = page * pageSize
    return filteredTransactions.slice(start, start + pageSize)
  }, [filteredTransactions, page, pageSize])

  const rangeStart = totalItems === 0 ? 0 : page * pageSize + 1
  const rangeEnd = totalItems === 0 ? 0 : rangeStart + paginatedTransactions.length - 1

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
            setFilteredTransactions={handleFilteredChange}
          />
        </div>

        <div className="flex-1 overflow-hidden rounded-lg border border-border/60 bg-card/90">
          <div className="flex h-full flex-col overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-border/60 bg-card/80 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-muted-foreground">
                {totalItems === 0
                  ? 'No transactions available'
                  : `Showing ${rangeStart.toLocaleString()}–${rangeEnd.toLocaleString()} of ${totalItems.toLocaleString()} transactions`}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">Rows per page</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => {
                    setPageSize(Number(value))
                    setPage(0)
                  }}
                >
                  <SelectTrigger className="h-8 w-[80px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {[25, 50, 100, 200].map((option) => (
                      <SelectItem key={option} value={String(option)}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                    disabled={page === 0}
                  >
                    ←
                  </Button>
                  <span className="min-w-[60px] text-center text-xs text-muted-foreground">
                    {rawPageCount === 0 ? '0 / 0' : `${page + 1} / ${rawPageCount}`}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage((prev) => Math.min(pageCount - 1, prev + 1))}
                    disabled={rawPageCount === 0 || page + 1 >= rawPageCount}
                  >
                    →
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              {totalItems === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    {transactions.length === 0
                      ? 'No transactions found yet. Connect an account or upload data to get started.'
                      : 'No transactions match your filters. Try adjusting the date range or clearing filters.'}
                  </p>
                </div>
              ) : (
                <TransactionTable
                  transactions={paginatedTransactions}
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
    </div>
  )
}


