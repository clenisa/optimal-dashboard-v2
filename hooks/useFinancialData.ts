import { useState, useEffect } from 'react'
import { useAuthState } from './use-auth-state'
import { fetchCategories, fetchSources, fetchTransactions, type CategoryData, type PaymentSourceData, type TransactionData } from '@/lib/chart-data'

export function useFinancialData() {
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [sources, setSources] = useState<PaymentSourceData[]>([])
  const [transactions, setTransactions] = useState<TransactionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthState()

  useEffect(() => {
    async function loadAllData() {
      console.log('[DEBUG] useFinancialData: Hook triggered, user:', user?.id)
      
      if (!user?.id) {
        console.log('[DEBUG] useFinancialData: No user ID available')
        setLoading(false)
        return
      }

      try {
        console.log('[DEBUG] useFinancialData: Starting data load for user', user.id)
        setLoading(true)
        setError(null)

        // Sequential loading like legacy
        console.log('[DEBUG] useFinancialData: Calling fetchCategories...')
        const categoriesData = await fetchCategories(user.id)
        console.log('[DEBUG] useFinancialData: fetchCategories returned:', categoriesData)
        setCategories(categoriesData)
        console.log('[DEBUG] useFinancialData: Categories loaded, count:', categoriesData.length)

        console.log('[DEBUG] useFinancialData: Calling fetchSources...')
        const sourcesData = await fetchSources(user.id)
        console.log('[DEBUG] useFinancialData: fetchSources returned:', sourcesData)
        setSources(sourcesData)
        console.log('[DEBUG] useFinancialData: Sources loaded, count:', sourcesData.length)

        console.log('[DEBUG] useFinancialData: Calling fetchTransactions...')
        const transactionsData = await fetchTransactions(user.id)
        console.log('[DEBUG] useFinancialData: fetchTransactions returned:', transactionsData)
        setTransactions(transactionsData)
        console.log('[DEBUG] useFinancialData: Transactions loaded, count:', transactionsData.length)

        console.log('[DEBUG] useFinancialData: All data loaded successfully')
        console.log('[DEBUG] useFinancialData: Final state:', {
          categories: categoriesData.length,
          sources: sourcesData.length,
          transactions: transactionsData.length
        })
      } catch (err) {
        console.error('[ERROR] useFinancialData:', err)
        setError('Failed to load financial data')
      } finally {
        setLoading(false)
      }
    }

    loadAllData()
  }, [user?.id])

  // Debug: Log every time the hook returns data
  console.log('[DEBUG] useFinancialData: Hook returning:', {
    categories: categories.length,
    sources: sources.length,
    transactions: transactions.length,
    loading,
    error
  })

  return { categories, sources, transactions, loading, error }
}
