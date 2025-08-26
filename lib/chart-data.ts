import { createClient } from "./supabase-client"

export interface CategoryData {
  category: string
  amount: number
  count: number
}

export interface PaymentSourceData {
  source: string
  balance: number
  transactions: number
}

export interface TransactionData {
  id: string
  date: string
  description: string
  amount: number
  category: string
  account: string
  type?: 'income' | 'expense'
}

export async function fetchCategories(userId: string): Promise<CategoryData[]> {
  if (!userId) {
    console.error('[ERROR] fetchCategories: No user ID provided')
    return []
  }

  try {
    console.log('[DEBUG] fetchCategories: Starting fetch for user', userId)
    const supabase = createClient()
    
    if (!supabase) {
      console.error('[ERROR] fetchCategories: Failed to initialize Supabase client')
      return []
    }

    // Get all expense transactions to calculate category totals
    const { data: transactionsData, error: transactionsError } = await supabase
      .from("transactions")
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
      console.error('[ERROR] fetchCategories: Transactions query error:', transactionsError)
      return []
    }

    if (!transactionsData || transactionsData.length === 0) {
      console.log('[DEBUG] fetchCategories: No expense transactions found')
      return []
    }

    console.log('[DEBUG] fetchCategories: Processing', transactionsData.length, 'expense transactions')
    console.log('[DEBUG] fetchCategories: Sample transactions:', transactionsData.slice(0, 5))

    // Calculate category totals from transactions
    const categoryTotals = new Map<string, { amount: number, count: number }>()
    
    transactionsData.forEach((txn: any) => {
      const category = txn.categories?.name || 'Uncategorized'
      const amount = Math.abs(txn.amount || 0) // Use absolute value for spending
      
      if (!categoryTotals.has(category)) {
        categoryTotals.set(category, { amount: 0, count: 0 })
      }
      
      const current = categoryTotals.get(category)!
      current.amount += amount
      current.count += 1
    })

    console.log('[DEBUG] fetchCategories: Category totals map:', Object.fromEntries(categoryTotals))

    // Transform to CategoryData format
    const categoryData: CategoryData[] = Array.from(categoryTotals.entries()).map(([category, totals]) => ({
      category,
      amount: totals.amount,
      count: totals.count
    }))

    console.log('[DEBUG] fetchCategories: Final category data:', categoryData)
    console.log('[DEBUG] fetchCategories: Category breakdown:', 
      categoryData.map(cat => `${cat.category}: $${cat.amount.toFixed(2)} (${cat.count} transactions)`))
    
    return categoryData
  } catch (error) {
    console.error('[ERROR] fetchCategories exception:', error)
    return []
  }
}

export async function fetchSources(userId: string): Promise<PaymentSourceData[]> {
  if (!userId) {
    console.error('[ERROR] fetchSources: No user ID provided')
    return []
  }

  try {
    console.log('[DEBUG] fetchSources: Starting fetch for user', userId)
    const supabase = createClient()
    
    if (!supabase) {
      console.error('[ERROR] fetchSources: Failed to initialize Supabase client')
      return []
    }

    // Get all sources for the user
    const { data: sourcesData, error: sourcesError } = await supabase
      .from("sources")
      .select("id, name, type, current_balance")
      .eq('user_id', userId)

    if (sourcesError) {
      console.error('[ERROR] fetchSources: Sources query error:', sourcesError)
      return []
    }

    if (!sourcesData || sourcesData.length === 0) {
      console.log('[DEBUG] fetchSources: No sources found')
      return []
    }

    console.log('[DEBUG] fetchSources: Processing', sourcesData.length, 'sources')
    console.log('[DEBUG] fetchSources: Sources data:', sourcesData)

    // Transform to PaymentSourceData format
    const sourceData: PaymentSourceData[] = sourcesData.map((source: any) => ({
      source: source.name,
      balance: source.current_balance || 0,
      transactions: 0 // We could count transactions per source if needed
    }))

    console.log('[DEBUG] fetchSources: Final source data:', sourceData)
    console.log('[DEBUG] fetchSources: Source breakdown:', 
      sourceData.map(acc => `${acc.source}: $${acc.balance.toFixed(2)}`))
    
    return sourceData
  } catch (error) {
    console.error('[ERROR] fetchSources exception:', error)
    return []
  }
}

export async function fetchTransactions(userId: string): Promise<TransactionData[]> {
  if (!userId) {
    console.error('[ERROR] fetchTransactions: No user ID provided')
    return []
  }

  try {
    console.log('[DEBUG] fetchTransactions: Starting fetch for user', userId)
    const supabase = createClient()
    
    if (!supabase) {
      console.error('[ERROR] fetchTransactions: Failed to initialize Supabase client')
      return []
    }

    const { data, error } = await supabase
      .from("transactions")
      .select(`
        id,
        date,
        description,
        amount,
        type,
        category_id,
        source_id,
        categories(name),
        sources(name)
      `)
      .eq('user_id', userId)
      .eq('mode', 'actual')
      .order("date", { ascending: false })

    if (error) {
      console.error('[ERROR] fetchTransactions: Database error:', error)
      return []
    }

    console.log('[DEBUG] fetchTransactions: Query result:', { data: data?.length, error })

    // Transform Supabase data to TransactionData format
    const transactionData: TransactionData[] =
      data?.map((txn: any) => ({
        id: txn.id || Math.random().toString(),
        date: txn.date || new Date().toISOString().split("T")[0],
        description: txn.description || "Unknown Transaction",
        amount: txn.amount || 0,
        category: txn.categories?.name || "Uncategorized",
        account: txn.sources?.name || "Unknown Account",
        type: txn.type as 'income' | 'expense' | undefined,
      })) || []

    console.log('[DEBUG] fetchTransactions: Fetched', transactionData.length, 'transactions')
    return transactionData
  } catch (error) {
    console.error('[ERROR] fetchTransactions exception:', error)
    return []
  }
}

export function generateCategoryData(categories: CategoryData[], transactions: TransactionData[]) {
  const labels = categories.map((cat) => cat.category)
  const amounts = categories.map((cat) => cat.amount)

  return {
    labels,
    datasets: [
      {
        label: "Amount Spent",
        data: amounts,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
      },
    ],
  }
}

export function generateSourceBalanceData(sources: PaymentSourceData[], threshold: number) {
  const filteredSources = sources.filter((source) => source.balance >= threshold)
  const labels = filteredSources.map((source) => source.source)
  const balances = filteredSources.map((source) => source.balance)

  return {
    labels,
    datasets: [
      {
        label: "Balance",
        data: balances,
        backgroundColor: [
          "rgba(255, 99, 132, 0.8)",
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 205, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(153, 102, 255, 0.8)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 205, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
      {
        type: "line" as const,
        label: "Warning Threshold",
        data: Array(labels.length).fill(threshold),
        borderColor: "rgba(255, 0, 0, 0.8)",
        backgroundColor: "rgba(255, 0, 0, 0.1)",
        borderWidth: 2,
        pointRadius: 0,
      },
    ],
  }
}
