import { createClient } from "./supabase-client"
import { logger } from "@/lib/logger"

// Color palette for category line charts
export const categoryColors = [
  "#4ecdc4", "#ff6b6b", "#45b7d1", "#96ceb4", "#feca57", "#ff9ff3",
  "#54a0ff", "#5f27cd", "#00d2d3", "#ff9f43", "#10ac84", "#ee5a24",
  "#0984e3", "#6c5ce7", "#a29bfe", "#fd79a8", "#fdcb6e", "#6c5ce7",
  "#74b9ff", "#00b894",
]

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
      logger.error('ChartData', 'fetchCategories: Transactions query error', transactionsError)
      return []
    }

    if (!transactionsData || transactionsData.length === 0) {
      logger.debug('ChartData', 'fetchCategories: No expense transactions found')
      return []
    }

    logger.debug('ChartData', 'fetchCategories: Processing expense transactions', { count: transactionsData.length })
    logger.debug('ChartData', 'fetchCategories: Sample transactions', { sample: transactionsData.slice(0, 5) })

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

    logger.debug('ChartData', 'fetchCategories: Category totals map', Object.fromEntries(categoryTotals))

    // Transform to CategoryData format
    const categoryData: CategoryData[] = Array.from(categoryTotals.entries()).map(([category, totals]) => ({
      category,
      amount: totals.amount,
      count: totals.count
    }))

    logger.debug('ChartData', 'fetchCategories: Final category data', categoryData)
    logger.debug('ChartData', 'fetchCategories: Category breakdown', 
      categoryData.map(cat => `${cat.category}: $${cat.amount.toFixed(2)} (${cat.count} transactions)`))
    
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

    // Get all sources for the user with required fields for utilization calculations
    const { data: sourcesData, error: sourcesError } = await supabase
      .from("sources")
      .select("id, name, type, current_balance, max_balance, interest_rate, created_at")
      .eq('user_id', userId)

    if (sourcesError) {
      logger.error('ChartData', 'fetchSources: Sources query error', sourcesError)
      return []
    }

    if (!sourcesData || sourcesData.length === 0) {
      logger.debug('ChartData', 'fetchSources: No sources found')
      return []
    }

    logger.debug('ChartData', 'fetchSources: Processing sources', { count: sourcesData.length })
    logger.debug('ChartData', 'fetchSources: Sources data', sourcesData)

    // Transform to PaymentSourceData format
    const sourceData: PaymentSourceData[] = sourcesData.map((source: any) => ({
      source: source.name,
      balance: Number(source.current_balance) || 0,
      transactions: 0, // We could count transactions per source if needed
      max_balance: source.max_balance != null ? Number(source.max_balance) : undefined,
      type: source.type === 'credit' || source.type === 'debit' ? source.type : undefined,
    }))

    logger.debug('ChartData', 'fetchSources: Final source data', sourceData)
    logger.debug('ChartData', 'fetchSources: Source breakdown', 
      sourceData.map(acc => `${acc.source}: $${acc.balance.toFixed(2)}`))
    
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
      logger.error('ChartData', 'fetchTransactions: Database error', error)
      return []
    }

    logger.debug('ChartData', 'fetchTransactions: Query result', { data: data?.length, error })

    // Transform Supabase data to TransactionData format
    const transactionData: TransactionData[] =
      data?.map((txn: any) => ({
        id: txn.id || Math.random().toString(),
        date: txn.date || new Date().toISOString().split("T")[0],
        description: txn.description || "Unknown Transaction",
        amount: txn.amount || 0,
        category: txn.categories?.name || "Uncategorized",
        account: txn.sources?.name || "Unknown Account",
        type: txn.type || "",
      })) || []

    logger.debug('ChartData', 'fetchTransactions: Fetched transactions', { count: transactionData.length })
    return transactionData
  } catch (error) {
    logger.error('ChartData', 'fetchTransactions exception', error)
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

// Generate multi-category monthly datasets for a line chart
export function generateMultiCategoryData(
  transactions: TransactionData[],
  categories: CategoryData[]
) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]

  const categoryData: Record<string, number[]> = {}

  // Initialize data arrays for each category name
  categories.forEach((cat) => {
    categoryData[cat.category] = new Array(12).fill(0)
  })

  // Process transactions: aggregate absolute expense amounts by month and category name
  transactions.forEach((txn) => {
    if (!txn?.date) return
    const date = new Date(txn.date)
    const monthIndex = date.getMonth()
    if (Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) return

    const amount = Math.abs(Number(txn.amount) || 0)
    const categoryName = txn.category || "Uncategorized"

    if (categoryData[categoryName]) {
      categoryData[categoryName][monthIndex] += amount
    }
  })

  // Create datasets for each category with distinct colors
  const datasets = categories.map((category, index) => {
    const color = categoryColors[index % categoryColors.length]
    return {
      label: category.category.toUpperCase(),
      data: categoryData[category.category],
      borderColor: color,
      backgroundColor: `${color}20`,
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: false,
    }
  })

  return {
    labels: months,
    datasets,
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
