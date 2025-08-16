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
        const categoriesData = await fetchCategories(user.id)
        setCategories(categoriesData)
        console.log('[DEBUG] useFinancialData: Categories loaded')

        const sourcesData = await fetchSources(user.id)
        setSources(sourcesData)
        console.log('[DEBUG] useFinancialData: Sources loaded')

        const transactionsData = await fetchTransactions(user.id)
        setTransactions(transactionsData)
        console.log('[DEBUG] useFinancialData: Transactions loaded')

        console.log('[DEBUG] useFinancialData: All data loaded successfully')
      } catch (err) {
        console.error('[ERROR] useFinancialData:', err)
        setError('Failed to load financial data')
      } finally {
        setLoading(false)
      }
    }

    loadAllData()
  }, [user?.id])

  return { categories, sources, transactions, loading, error }
}
