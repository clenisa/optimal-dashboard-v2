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
}

// Helper function to create sample data for testing
function createSampleData(userId: string) {
  console.log('[DEBUG] Creating sample data for user:', userId)
  
  const sampleCategories: CategoryData[] = [
    { category: "Food & Dining", amount: 1250.75, count: 23 },
    { category: "Transportation", amount: 890.50, count: 15 },
    { category: "Shopping", amount: 2100.25, count: 31 },
    { category: "Entertainment", amount: 650.00, count: 12 },
    { category: "Bills & Utilities", amount: 1800.00, count: 8 },
  ]

  const sampleSources: PaymentSourceData[] = [
    { source: "Checking Account", balance: 2500.75, transactions: 45 },
    { source: "Credit Card", balance: -1850.25, transactions: 32 },
    { source: "Savings Account", balance: 750.00, transactions: 8 },
  ]

  return { sampleCategories, sampleSources }
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

    // First get all categories for the user
    const { data: categoriesData, error: categoriesError } = await supabase
      .from("categories")
      .select("*")
      .eq('user_id', userId)
      .order("name")

    if (categoriesError) {
      console.error('[ERROR] fetchCategories: Categories query error:', categoriesError)
      // Continue without categories - we'll extract them from transactions
    }

    // Then get all transactions to calculate totals
    const { data: transactionsData, error: transactionsError } = await supabase
      .from("transactions")
      .select("category, amount")
      .eq('user_id', userId)

    if (transactionsError) {
      console.error('[ERROR] fetchCategories: Transactions query error:', transactionsError)
      // If no transactions exist, create sample data for testing
      const { sampleCategories } = createSampleData(userId)
      console.log('[DEBUG] fetchCategories: Using sample data:', sampleCategories)
      return sampleCategories
    }

    // If no transactions exist, create sample data
    if (!transactionsData || transactionsData.length === 0) {
      const { sampleCategories } = createSampleData(userId)
      console.log('[DEBUG] fetchCategories: No transactions found, using sample data:', sampleCategories)
      return sampleCategories
    }

    console.log('[DEBUG] fetchCategories: Raw data:', { 
      categories: categoriesData?.length, 
      transactions: transactionsData?.length 
    })

    // Calculate category totals from transactions
    const categoryTotals = new Map<string, { amount: number, count: number }>()
    
    transactionsData?.forEach((txn: any) => {
      const category = txn.category || 'Uncategorized'
      const amount = Math.abs(txn.amount || 0) // Use absolute value for spending
      
      if (!categoryTotals.has(category)) {
        categoryTotals.set(category, { amount: 0, count: 0 })
      }
      
      const current = categoryTotals.get(category)!
      current.amount += amount
      current.count += 1
    })

    // Transform to CategoryData format
    const categoryData: CategoryData[] = Array.from(categoryTotals.entries()).map(([category, totals]) => ({
      category,
      amount: totals.amount,
      count: totals.count
    }))

    console.log('[DEBUG] fetchCategories: Calculated totals:', categoryData)
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

    // First get all sources for the user
    const { data: sourcesData, error: sourcesError } = await supabase
      .from("sources")
      .select("*")
      .eq('user_id', userId)
      .order("name")

    if (sourcesError) {
      console.error('[ERROR] fetchSources: Sources query error:', sourcesError)
      // Continue without sources - we'll extract them from transactions
    }

    // Then get all transactions to calculate current balances
    const { data: transactionsData, error: transactionsError } = await supabase
      .from("transactions")
      .select("account, amount")
      .eq('user_id', userId)

    if (transactionsError) {
      console.error('[ERROR] fetchSources: Transactions query error:', transactionsError)
      // If no transactions exist, create sample data for testing
      const { sampleSources } = createSampleData(userId)
      console.log('[DEBUG] fetchSources: Using sample data:', sampleSources)
      return sampleSources
    }

    // If no transactions exist, create sample data
    if (!transactionsData || transactionsData.length === 0) {
      const { sampleSources } = createSampleData(userId)
      console.log('[DEBUG] fetchSources: No transactions found, using sample data:', sampleSources)
      return sampleSources
    }

    console.log('[DEBUG] fetchSources: Raw data:', { 
      sources: sourcesData?.length, 
      transactions: transactionsData?.length 
    })

    // Calculate account balances from transactions
    const accountBalances = new Map<string, { balance: number, transactions: number }>()
    
    transactionsData?.forEach((txn: any) => {
      const account = txn.account || 'Unknown Account'
      const amount = txn.amount || 0
      
      if (!accountBalances.has(account)) {
        accountBalances.set(account, { balance: 0, transactions: 0 })
      }
      
      const current = accountBalances.get(account)!
      current.balance += amount // Add/subtract based on transaction type
      current.transactions += 1
    })

    // Transform to PaymentSourceData format
    const sourceData: PaymentSourceData[] = Array.from(accountBalances.entries()).map(([source, data]) => ({
      source,
      balance: data.balance,
      transactions: data.transactions
    }))

    console.log('[DEBUG] fetchSources: Calculated balances:', sourceData)
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
      .select("*")
      .eq('user_id', userId)
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
        category: txn.category || "Uncategorized",
        account: txn.account || txn.source || "Unknown Account",
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
