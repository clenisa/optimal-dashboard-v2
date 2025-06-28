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

// Mock data fallback
const mockCategories: CategoryData[] = [
  { category: "Food & Dining", amount: 1250.75, count: 23 },
  { category: "Transportation", amount: 890.5, count: 15 },
  { category: "Shopping", amount: 2100.25, count: 31 },
  { category: "Entertainment", amount: 650.0, count: 12 },
  { category: "Bills & Utilities", amount: 1800.0, count: 8 },
  { category: "Healthcare", amount: 450.25, count: 5 },
]

const mockSources: PaymentSourceData[] = [
  { source: "Checking Account", balance: 2500.75, transactions: 45 },
  { source: "Credit Card", balance: 1850.25, transactions: 32 },
  { source: "Savings Account", balance: 750.0, transactions: 8 },
  { source: "Debit Card", balance: 1200.5, transactions: 28 },
]

const mockTransactions: TransactionData[] = [
  {
    id: "1",
    date: "2024-01-15",
    description: "Grocery Store",
    amount: -85.5,
    category: "Food & Dining",
    account: "Checking Account",
  },
  {
    id: "2",
    date: "2024-01-14",
    description: "Gas Station",
    amount: -45.0,
    category: "Transportation",
    account: "Credit Card",
  },
  {
    id: "3",
    date: "2024-01-13",
    description: "Online Shopping",
    amount: -120.75,
    category: "Shopping",
    account: "Credit Card",
  },
  {
    id: "4",
    date: "2024-01-12",
    description: "Restaurant",
    amount: -65.25,
    category: "Food & Dining",
    account: "Debit Card",
  },
  {
    id: "5",
    date: "2024-01-11",
    description: "Electric Bill",
    amount: -150.0,
    category: "Bills & Utilities",
    account: "Checking Account",
  },
]

export async function fetchCategories(): Promise<CategoryData[]> {
  try {
    const supabase = createClient()
    if (!supabase) {
      console.warn("Supabase client not available, using mock data")
      return mockCategories
    }

    const { data, error } = await supabase.from("categories").select("*").order("name")

    if (error) {
      console.error("Error fetching categories:", error)
      return mockCategories
    }

    // Transform Supabase data to CategoryData format
    const categoryData: CategoryData[] =
      data?.map((cat: any) => ({
        category: cat.name || cat.category || "Unknown",
        amount: cat.amount || cat.total_amount || 0,
        count: cat.count || cat.transaction_count || 0,
      })) || []

    return categoryData.length > 0 ? categoryData : mockCategories
  } catch (error) {
    console.error("Error in fetchCategories:", error)
    return mockCategories
  }
}

export async function fetchSources(): Promise<PaymentSourceData[]> {
  try {
    const supabase = createClient()
    if (!supabase) {
      console.warn("Supabase client not available, using mock data")
      return mockSources
    }

    const { data, error } = await supabase.from("sources").select("*").order("name")

    if (error) {
      console.error("Error fetching sources:", error)
      return mockSources
    }

    // Transform Supabase data to PaymentSourceData format
    const sourceData: PaymentSourceData[] =
      data?.map((source: any) => ({
        source: source.name || source.source || "Unknown",
        balance: source.balance || source.amount || 0,
        transactions: source.transactions || source.transaction_count || 0,
      })) || []

    return sourceData.length > 0 ? sourceData : mockSources
  } catch (error) {
    console.error("Error in fetchSources:", error)
    return mockSources
  }
}

export async function fetchTransactions(): Promise<TransactionData[]> {
  try {
    const supabase = createClient()
    if (!supabase) {
      console.warn("Supabase client not available, using mock data")
      return mockTransactions
    }

    const { data, error } = await supabase.from("transactions").select("*").order("date", { ascending: false })

    if (error) {
      console.error("Error fetching transactions:", error)
      return mockTransactions
    }

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

    return transactionData.length > 0 ? transactionData : mockTransactions
  } catch (error) {
    console.error("Error in fetchTransactions:", error)
    return mockTransactions
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
