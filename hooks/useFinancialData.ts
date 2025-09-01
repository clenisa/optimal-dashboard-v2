import { useState, useEffect } from 'react'
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

  useEffect(() => {
    async function loadAllData() {
      logger.debug('useFinancialData', 'Hook triggered', { userId: user?.id })
      
      if (!user?.id) {
        logger.debug('useFinancialData', 'No user ID available')
        setLoading(false)
        return
      }

      try {
        logger.debug('useFinancialData', 'Starting data load', { userId: user.id })
        setLoading(true)
        setError(null)

        // Sequential loading like legacy
        logger.debug('useFinancialData', 'Fetching categories')
        const categoriesData = await fetchCategories(user.id)
        logger.debug('useFinancialData', 'Categories fetched', { count: categoriesData.length })
        setCategories(categoriesData)
        logger.debug('useFinancialData', 'Categories loaded', { count: categoriesData.length })

        logger.debug('useFinancialData', 'Fetching sources')
        const sourcesData = await fetchSources(user.id)
        logger.debug('useFinancialData', 'Sources fetched', { count: sourcesData.length })
        setSources(sourcesData)
        logger.debug('useFinancialData', 'Sources loaded', { count: sourcesData.length })

        logger.debug('useFinancialData', 'Fetching transactions')
        const transactionsData = await fetchTransactions(user.id)
        logger.debug('useFinancialData', 'Transactions fetched', { count: transactionsData.length })
        setTransactions(transactionsData)
        logger.debug('useFinancialData', 'Transactions loaded', { count: transactionsData.length })

        logger.debug('useFinancialData', 'All data loaded successfully')
        logger.debug('useFinancialData', 'Final state', {
          categories: categoriesData.length,
          sources: sourcesData.length,
          transactions: transactionsData.length
        })
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
    }

    loadAllData()
  }, [user?.id])

  // Debug: Log every time the hook returns data
  logger.debug('useFinancialData', 'Hook returning', {
    categories: categories.length,
    sources: sources.length,
    transactions: transactions.length,
    loading,
    error
  })

  return { categories, sources, transactions, loading, error }
}
