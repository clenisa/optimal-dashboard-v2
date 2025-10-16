import { useState, useEffect, useCallback } from 'react'
import { useAuthState } from './use-auth-state'
import { fetchCategories, fetchSources, fetchTransactions, type CategoryData, type PaymentSourceData, type TransactionData } from '@/lib/chart-data'
import { logger } from '@/lib/logger'

export function useFinancialData() {
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [sources, setSources] = useState<PaymentSourceData[]>([])
  const [transactions, setTransactions] = useState<TransactionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthState()
  const shouldLog = process.env.NODE_ENV !== 'production'

  const loadAllData = useCallback(async () => {
    if (shouldLog) {
      logger.debug('useFinancialData', 'Hook triggered', { userId: user?.id })
    }

    if (!user?.id) {
      if (shouldLog) {
        logger.debug('useFinancialData', 'No user ID available')
      }
      setCategories([])
      setSources([])
      setTransactions([])
      setLoading(false)
      return
    }

    try {
      if (shouldLog) {
        logger.debug('useFinancialData', 'Starting data load', { userId: user.id })
      }
      setLoading(true)
      setError(null)

      if (shouldLog) {
        logger.debug('useFinancialData', 'Fetching categories')
      }
      const categoriesData = await fetchCategories(user.id)
      setCategories(categoriesData)

      if (shouldLog) {
        logger.debug('useFinancialData', 'Fetching sources')
      }
      const sourcesData = await fetchSources(user.id)
      setSources(sourcesData)

      if (shouldLog) {
        logger.debug('useFinancialData', 'Fetching transactions')
      }
      const transactionsData = await fetchTransactions(user.id)
      setTransactions(transactionsData)

      if (shouldLog) {
        logger.debug('useFinancialData', 'All data loaded successfully', {
          categories: categoriesData.length,
          sources: sourcesData.length,
          transactions: transactionsData.length,
        })
      }
    } catch (err) {
      logger.error(
        'useFinancialData',
        'Failed to load data',
        { error: err instanceof Error ? err.message : String(err) }
      )
      setError('Failed to load financial data')
    } finally {
      setLoading(false)
    }
  }, [shouldLog, user?.id])

  useEffect(() => {
    void loadAllData()
  }, [loadAllData])

  // Debug: Log every time the hook returns data
  if (shouldLog) {
    logger.debug('useFinancialData', 'Hook returning', {
      categories: categories.length,
      sources: sources.length,
      transactions: transactions.length,
      loading,
      error
    })
  }

  return { categories, sources, transactions, loading, error, reload: loadAllData }
}
