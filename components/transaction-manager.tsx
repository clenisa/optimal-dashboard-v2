"use client"

import { useState, useEffect } from 'react'
import { useAuthState } from '@/hooks/use-auth-state'
import { useFinancialData } from '@/hooks/useFinancialData'
import { TransactionData } from '@/lib/chart-data'
import { TransactionTable } from '@/components/transaction-table'
import { TransactionFilters } from '@/components/transaction-filters'
import { TransactionSummary } from '@/components/transaction-summary'

export function TransactionManager() {
  const { user } = useAuthState()
  const { transactions, loading, error } = useFinancialData()
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionData[]>([])

  useEffect(() => {
    setFilteredTransactions(transactions)
  }, [transactions])

  if (!user) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600 dark:text-gray-400">Please log in to view your transactions.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600 dark:text-gray-400">Loading transactions...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="p-2 h-full overflow-auto">
      <h1 className="text-xl font-bold mb-2">Transactions</h1>
      <div className="mb-2">
        <TransactionSummary transactions={filteredTransactions} />
      </div>
      <div className="flex flex-col flex-1">
        <TransactionFilters
          allTransactions={transactions}
          setFilteredTransactions={setFilteredTransactions}
        />
        <div className="flex-1 overflow-auto">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                {transactions.length === 0 ? 'No transactions found.' : 'No transactions match your filters.'}
              </p>
            </div>
          ) : (
            <TransactionTable
              transactions={filteredTransactions}
              onTransactionUpdated={(updated) => {
                setFilteredTransactions(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated } : t))
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}


