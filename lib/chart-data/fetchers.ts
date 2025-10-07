import { createClient } from '@/lib/supabase-client'
import { logger } from '@/lib/logger'

export interface CategoryData {
  category: string
  amount: number
  count: number
}

export interface PaymentSourceData {
  source: string
  balance: number
  transactions: number
  max_balance?: number
  type?: 'credit' | 'debit'
}

export interface TransactionData {
  id: string
  date: string
  description: string
  amount: number
  category: string
  account: string
  type: string
  provider?: string | null
  provider_method?: string | null
  provider_confidence?: number | null
  provider_inferred_at?: string | null
}

export async function fetchCategories(userId: string): Promise<CategoryData[]> {
  if (!userId) {
    logger.error('ChartData', 'fetchCategories: No user ID provided')
    return []
  }

  try {
    logger.debug('ChartData', 'fetchCategories: Starting fetch', { userId })
    const supabase = createClient()

    if (!supabase) {
      logger.error('ChartData', 'fetchCategories: Failed to initialize Supabase client')
      return []
    }

    const { data: transactionsData, error: transactionsError } = await supabase
      .from('transactions')
      .select(`
        amount,
        type,
        category_id,
        categories!inner(name)
      `)
      .eq('user_id', userId)
      .eq('type', 'expense')
      .eq('mode', 'actual')

    if (transactionsError) {
      logger.error('ChartData', 'fetchCategories: Transactions query error', transactionsError)
      return []
    }

    if (!transactionsData || transactionsData.length === 0) {
      logger.debug('ChartData', 'fetchCategories: No expense transactions found')
      return []
    }

    const categoryTotals = new Map<string, { amount: number; count: number }>()

    transactionsData.forEach((txn: any) => {
      const category = txn.categories?.name || 'Uncategorized'
      const amount = Math.abs(txn.amount || 0)

      if (!categoryTotals.has(category)) {
        categoryTotals.set(category, { amount: 0, count: 0 })
      }

      const current = categoryTotals.get(category)!
      current.amount += amount
      current.count += 1
    })

    const categoryData: CategoryData[] = Array.from(categoryTotals.entries()).map(
      ([category, totals]) => ({
        category,
        amount: totals.amount,
        count: totals.count,
      }),
    )

    return categoryData
  } catch (error) {
    logger.error('ChartData', 'fetchCategories exception', error)
    return []
  }
}

export async function fetchSources(userId: string): Promise<PaymentSourceData[]> {
  if (!userId) {
    logger.error('ChartData', 'fetchSources: No user ID provided')
    return []
  }

  try {
    logger.debug('ChartData', 'fetchSources: Starting fetch', { userId })
    const supabase = createClient()

    if (!supabase) {
      logger.error('ChartData', 'fetchSources: Failed to initialize Supabase client')
      return []
    }

    const { data, error } = await supabase
      .from('sources')
      .select(`
        name,
        current_balance,
        type,
        max_balance
      `)
      .eq('user_id', userId)

    if (error) {
      logger.error('ChartData', 'fetchSources: Database error', error)
      return []
    }

    if (!data) {
      return []
    }

    const sourceData: PaymentSourceData[] = data.map((source: any) => ({
      source: source.name,
      balance: source.current_balance ?? 0,
      transactions: 0,
      max_balance: source.max_balance ?? undefined,
      type: source.type ?? undefined,
    }))

    return sourceData
  } catch (error) {
    logger.error('ChartData', 'fetchSources exception', error)
    return []
  }
}

export async function fetchTransactions(userId: string): Promise<TransactionData[]> {
  if (!userId) {
    logger.error('ChartData', 'fetchTransactions: No user ID provided')
    return []
  }

  try {
    logger.debug('ChartData', 'fetchTransactions: Starting fetch', { userId })
    const supabase = createClient()

    if (!supabase) {
      logger.error('ChartData', 'fetchTransactions: Failed to initialize Supabase client')
      return []
    }

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id,
        date,
        description,
        amount,
        type,
        category_id,
        source_id,
        provider,
        provider_method,
        provider_confidence,
        provider_inferred_at,
        categories(name),
        sources(name)
      `)
      .eq('user_id', userId)
      .eq('mode', 'actual')
      .order('date', { ascending: false })

    if (error) {
      logger.error('ChartData', 'fetchTransactions: Database error', error)
      return []
    }

    const transactionData: TransactionData[] =
      data?.map((txn: any) => ({
        id: txn.id || Math.random().toString(),
        date: txn.date || new Date().toISOString().split('T')[0],
        description: txn.description || 'Unknown Transaction',
        amount: txn.amount || 0,
        category: txn.categories?.name || 'Uncategorized',
        account: txn.sources?.name || 'Unknown Account',
        type: txn.type || '',
        provider: txn.provider || null,
        provider_method: txn.provider_method || null,
        provider_confidence: txn.provider_confidence || null,
        provider_inferred_at: txn.provider_inferred_at || null,
      })) ?? []

    return transactionData
  } catch (error) {
    logger.error('ChartData', 'fetchTransactions exception', error)
    return []
  }
}
