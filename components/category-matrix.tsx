"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase-client"
import { ChevronUp, ChevronDown, BarChart3 } from "lucide-react"

interface Transaction {
  id: number
  category_id: string
  amount: number
  date: string
  type: 'income' | 'expense' | 'transfer'
}

interface Category {
  id: string
  name: string
  color: string
}

interface CategoryPeriodData {
  values: Record<string, number>
  total: number
  categoryName: string
}

interface MatrixData {
  [categoryId: string]: CategoryPeriodData
}

type ViewType = '6months' | '12months' | 'currentYear'
type SortOrder = 'asc' | 'desc' | null

export function CategoryMatrix() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [matrixData, setMatrixData] = useState<MatrixData>({})
  const [periods, setPeriods] = useState<string[]>([])
  const [viewType, setViewType] = useState<ViewType>('6months')
  const [loading, setLoading] = useState(true)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (transactions.length > 0 && categories.length > 0) {
      updateMatrix()
    }
  }, [transactions, categories, viewType])

  const fetchData = async () => {
    setLoading(true)
    const supabase = createClient()
    if (!supabase) {
      setTransactions([])
      setCategories([])
      setLoading(false)
      return
    }
    
    const [transactionsResult, categoriesResult] = await Promise.all([
      supabase.from("transactions").select("id,category_id,amount,date,type"),
      supabase.from("categories").select("id,name,color")
    ])

    if (transactionsResult.error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching transactions:", transactionsResult.error)
      setTransactions([])
    } else {
      setTransactions((transactionsResult.data as any) || [])
    }

    if (categoriesResult.error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching categories:", categoriesResult.error)
      setCategories([])
    } else {
      setCategories((categoriesResult.data as any) || [])
    }

    // eslint-disable-next-line no-console
    console.log('=== FETCH DATA DEBUG ===')
    // eslint-disable-next-line no-console
    console.log('Transactions fetched:', (transactionsResult.data as any)?.length ?? 0)
    // eslint-disable-next-line no-console
    console.log('Categories fetched:', (categoriesResult.data as any)?.length ?? 0)
    // eslint-disable-next-line no-console
    console.log('Sample transaction:', (transactionsResult.data as any)?.[0])
    // eslint-disable-next-line no-console
    console.log('Sample category:', (categoriesResult.data as any)?.[0])

    setLoading(false)
  }

  const generatePeriods = (type: ViewType): string[] => {
    const now = new Date()
    const result: string[] = []

    switch (type) {
      case '6months':
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
          result.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }).toUpperCase())
        }
        break
      case '12months':
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
          result.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }).toUpperCase())
        }
        break
      case 'currentYear':
        for (let month = 0; month < 12; month++) {
          const date = new Date(now.getFullYear(), month, 1)
          result.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }).toUpperCase())
        }
        break
    }

    return result
  }

  const updateMatrix = () => {
    const newPeriods = generatePeriods(viewType)
    setPeriods(newPeriods)

    const expenseTransactions = transactions.filter((t: Transaction) => {
      return t.type === 'expense' || 
             (t.amount && Number(t.amount) < 0) || 
             !t.type
    })

    // eslint-disable-next-line no-console
    console.log('=== UPDATE MATRIX DEBUG ===')
    // eslint-disable-next-line no-console
    console.log('Total transactions:', transactions.length)
    // eslint-disable-next-line no-console
    console.log('Expense transactions:', expenseTransactions.length)
    // eslint-disable-next-line no-console
    console.log('Categories available:', categories.length)
    // eslint-disable-next-line no-console
    console.log('Generated periods:', newPeriods)
    // eslint-disable-next-line no-console
    console.log('Transaction types:', [...new Set(transactions.map(t => t.type))])
    // eslint-disable-next-line no-console
    console.log('Category IDs:', categories.map(c => c.id))
    // eslint-disable-next-line no-console
    console.log('Transaction category IDs:', [...new Set(transactions.map(t => t.category_id))])

    const matrix: MatrixData = {}

    categories.forEach((category: Category) => {
      matrix[category.id] = {
        categoryName: category.name,
        total: 0,
        values: {}
      }
      newPeriods.forEach((period: string) => {
        matrix[category.id].values[period] = 0
      })
    })

    // Ensure all referenced categories exist
    const categoryIds = new Set(categories.map(c => c.id))
    const validTransactions = expenseTransactions.filter(t => {
      if (!categoryIds.has(t.category_id)) {
        // eslint-disable-next-line no-console
        console.warn(`Transaction ${t.id} references missing category ${t.category_id}`)
        return false
      }
      return true
    })
    // eslint-disable-next-line no-console
    console.log(`Filtered ${expenseTransactions.length} to ${validTransactions.length} valid transactions`)

    let processedCount = 0
    let skippedCount = 0

    validTransactions.forEach((transaction: Transaction) => {
      const transactionDate = new Date(transaction.date)
      const period = transactionDate.toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit'
      }).toUpperCase()

      if (matrix[transaction.category_id] && newPeriods.includes(period)) {
        matrix[transaction.category_id].values[period] += Number(transaction.amount)
        matrix[transaction.category_id].total += Number(transaction.amount)
        processedCount++
      } else {
        skippedCount++
        if (!matrix[transaction.category_id]) {
          // eslint-disable-next-line no-console
          console.warn(`Missing category ${transaction.category_id} for transaction ${transaction.id}`)
        }
        if (!newPeriods.includes(period)) {
          // eslint-disable-next-line no-console
          console.warn(`Period ${period} not in range for transaction ${transaction.id}. Available periods:`, newPeriods)
        }
      }
    })
    // eslint-disable-next-line no-console
    console.log(`Processed ${processedCount} transactions, skipped ${skippedCount}`)
    // eslint-disable-next-line no-console
    console.log('Final matrix data:', matrix)

    setMatrixData(matrix)
  }

  const formatCurrency = (amount: number): string => {
    if (amount === 0) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const handleColumnSort = (column: string) => {
    if (sortColumn === column) {
      if (sortOrder === 'asc') {
        setSortOrder('desc')
      } else if (sortOrder === 'desc') {
        setSortOrder(null)
        setSortColumn(null)
      }
    } else {
      setSortColumn(column)
      setSortOrder('asc')
    }
  }

  const getSortedCategories = (): string[] => {
    // eslint-disable-next-line no-console
    console.log('getSortedCategories() called with sortColumn/sortOrder:', sortColumn, sortOrder)
    const categoryIds = Object.keys(matrixData)
    // eslint-disable-next-line no-console
    console.log('getSortedCategories() matrixData keys:', categoryIds)
    // eslint-disable-next-line no-console
    if (categoryIds.length > 0) console.log('getSortedCategories() sample entry:', categoryIds[0], matrixData[categoryIds[0]])

    const validCategoryIds = categoryIds.filter((id: string) => {
      const exists = Boolean(matrixData[id])
      const hasName = exists && matrixData[id].categoryName !== undefined
      if (!exists || !hasName) {
        // eslint-disable-next-line no-console
        console.warn('Excluding category id', id, 'exists:', exists, 'hasName:', hasName)
      }
      return exists && hasName
    })

    // eslint-disable-next-line no-console
    console.log('getSortedCategories() validCategoryIds:', validCategoryIds)

    if (!sortColumn || !sortOrder) {
      // eslint-disable-next-line no-console
      console.log('getSortedCategories() default sort by name')
      const before = [...validCategoryIds]
      const result = validCategoryIds.sort((a: string, b: string) => {
        const categoryA = matrixData[a]
        const categoryB = matrixData[b]

        if (!categoryA || !categoryB) return 0
        if (!categoryA.categoryName || !categoryB.categoryName) return 0

        return categoryA.categoryName.localeCompare(categoryB.categoryName)
      })
      // eslint-disable-next-line no-console
      console.log('getSortedCategories() sort result:', result.map(id => ({ id, name: matrixData[id]?.categoryName })), 'before:', before)
      return result
    }

    // eslint-disable-next-line no-console
    console.log('getSortedCategories() sorting by', sortColumn, sortOrder)
    // eslint-disable-next-line no-console
    console.log('getSortedCategories() values pre-sort:', validCategoryIds.map(id => ({ id, value: sortColumn === 'total' ? (matrixData[id]?.total || 0) : (matrixData[id]?.values?.[sortColumn] || 0) })))

    const sorted = validCategoryIds.sort((a: string, b: string) => {
      const dataA = matrixData[a]
      const dataB = matrixData[b]

      if (!dataA || !dataB) return 0

      let valueA: number
      let valueB: number

      if (sortColumn === 'total') {
        valueA = dataA.total || 0
        valueB = dataB.total || 0
      } else {
        valueA = dataA.values[sortColumn] || 0
        valueB = dataB.values[sortColumn] || 0
      }

      if (sortOrder === 'asc') {
        return valueA - valueB
      } else {
        return valueB - valueA
      }
    })

    // eslint-disable-next-line no-console
    console.log('getSortedCategories() values post-sort:', sorted.map(id => ({ id, value: sortColumn === 'total' ? (matrixData[id]?.total || 0) : (matrixData[id]?.values?.[sortColumn] || 0) })))
    return sorted
  }

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return null
    if (sortOrder === 'asc') return <ChevronUp className="h-4 w-4" />
    if (sortOrder === 'desc') return <ChevronDown className="h-4 w-4" />
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            Loading category matrix...
          </div>
        </CardContent>
      </Card>
    )
  }

  const sortedCategoryIds = getSortedCategories()
  // eslint-disable-next-line no-console
  console.log('Rendering Category Matrix with sortedCategoryIds:', sortedCategoryIds)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Category Matrix
        </CardTitle>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">View:</span>
            <Select value={viewType} onValueChange={(value: ViewType) => setViewType(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="12months">Last 12 Months</SelectItem>
                <SelectItem value="currentYear">Current Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {false ? (
          <div className="text-center py-8 text-muted-foreground">
            No transaction data available for matrix analysis.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table key={`matrix-${Object.keys(matrixData).length}-${JSON.stringify(periods)}`} className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Category</th>
                  {periods.map(period => (
                    <th key={period} className="text-center p-3 font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleColumnSort(period)}
                        className="flex items-center gap-1 h-auto p-1"
                      >
                        {period}
                        {getSortIcon(period)}
                      </Button>
                    </th>
                  ))}
                  <th className="text-center p-3 font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleColumnSort('total')}
                      className="flex items-center gap-1 h-auto p-1"
                    >
                      Total
                      {getSortIcon('total')}
                    </Button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Debug: show if tbody renders */}
                {/* eslint-disable-next-line no-console */}
                {console.log('Table body render start. Row candidates:', sortedCategoryIds)}
                {sortedCategoryIds.map((categoryId: string) => {
                  const categoryData = matrixData[categoryId]
                  // eslint-disable-next-line no-console
                  console.log('Rendering row for categoryId:', categoryId, 'data:', categoryData)
                  if (!categoryData) {
                    // eslint-disable-next-line no-console
                    console.warn('Missing categoryData for id', categoryId)
                    return null
                  }
                  if (categoryData.total === 0) {
                    // eslint-disable-next-line no-console
                    console.log('Skipping categoryId due to zero total:', categoryId)
                    return null
                  }
                  return (
                    <tr key={categoryId} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{categoryData.categoryName}</td>
                      {periods.map((period: string) => (
                        <td key={period} className="p-3 text-center font-mono text-sm">
                          {formatCurrency(categoryData.values[period] || 0)}
                        </td>
                      ))}
                      <td className="p-3 text-center font-mono text-sm font-medium">
                        {formatCurrency(categoryData.total)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

