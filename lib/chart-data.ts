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

// Function to check if categories table exists
async function checkCategoriesTable(supabase: any): Promise<boolean> {
  try {
    console.log("🔍 [DEBUG] checkCategoriesTable: Checking if categories table exists")
    
    // Try to query the table to see if it exists
    const { data, error } = await supabase.from("categories").select("count").limit(1)
    
    if (error) {
      console.warn("⚠️ [DEBUG] checkCategoriesTable: Categories table doesn't exist")
      console.warn("⚠️ [DEBUG] checkCategoriesTable: Error details:", error)
      return false
    }
    
    console.log("🔍 [DEBUG] checkCategoriesTable: Categories table exists")
    return true
  } catch (error) {
    console.warn("⚠️ [DEBUG] checkCategoriesTable: Error checking table:", error)
    return false
  }
}

export async function fetchCategories(): Promise<CategoryData[]> {
  try {
    console.log("🔍 [DEBUG] fetchCategories: Starting to fetch categories from Supabase")
    const supabase = createClient()
    if (!supabase) {
      console.warn("⚠️ [DEBUG] Supabase client not available, using mock data")
      return mockCategories
    }

    console.log("🔍 [DEBUG] fetchCategories: Supabase client created, checking categories table")
    
    // Check if the categories table exists
    const tableExists = await checkCategoriesTable(supabase)
    if (!tableExists) {
      console.warn("⚠️ [DEBUG] fetchCategories: Categories table doesn't exist, using mock data")
      console.warn("⚠️ [DEBUG] fetchCategories: To create the table, run this SQL in your Supabase dashboard:")
      console.warn("⚠️ [DEBUG] fetchCategories: CREATE TABLE categories (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, amount DECIMAL(10,2) DEFAULT 0, count INTEGER DEFAULT 0, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());")
      return mockCategories
    }
    
    console.log("🔍 [DEBUG] fetchCategories: Categories table exists, querying data")
    
    // Try to query the categories table
    let data: any = null
    let error: any = null
    
    try {
      const result = await supabase.from("categories").select("*").order("name")
      data = result.data
      error = result.error
      console.log("🔍 [DEBUG] fetchCategories: Query completed")
    } catch (queryError) {
      console.error("❌ [DEBUG] fetchCategories: Query failed with exception:", queryError)
      error = queryError
    }

    if (error) {
      console.error("❌ [DEBUG] Error fetching categories:", error)
      console.error("❌ [DEBUG] Error details:", JSON.stringify(error, null, 2))
      console.warn("⚠️ [DEBUG] fetchCategories: Using mock data due to error")
      return mockCategories
    }

    console.log("🔍 [DEBUG] fetchCategories: Raw data from Supabase:", data)
    console.log("🔍 [DEBUG] fetchCategories: Data length:", data?.length || 0)

    // Check if data is null or undefined
    if (!data) {
      console.warn("⚠️ [DEBUG] fetchCategories: No data returned from Supabase, using mock data")
      return mockCategories
    }

    // Transform Supabase data to CategoryData format
    const categoryData: CategoryData[] =
      data?.map((cat: any) => {
        console.log("🔍 [DEBUG] fetchCategories: Raw category object:", cat)
        console.log("🔍 [DEBUG] fetchCategories: Available keys:", Object.keys(cat))
        
        const transformed = {
          category: cat.name || cat.category || "Unknown",
          amount: Number(cat.amount || cat.total_amount || cat.amount_spent || cat.value || 0),
          count: Number(cat.count || cat.transaction_count || cat.transactions || 0),
        }
        console.log("🔍 [DEBUG] fetchCategories: Transformed category:", transformed)
        return transformed
      }) || []

    console.log("🔍 [DEBUG] fetchCategories: Final transformed data:", categoryData)
    console.log("🔍 [DEBUG] fetchCategories: Categories with amounts > 0:", categoryData.filter(cat => cat.amount > 0).length)

    const result = categoryData.length > 0 ? categoryData : mockCategories
    console.log("🔍 [DEBUG] fetchCategories: Returning result:", result)
    return result
  } catch (error) {
    console.error("❌ [DEBUG] Error in fetchCategories:", error)
    console.error("❌ [DEBUG] Error stack:", error instanceof Error ? error.stack : "No stack trace")
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
