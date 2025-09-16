"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase-client"
import { ChevronUp, ChevronDown, BarChart3 } from "lucide-react"

interface Transaction {
  id: number
  category_id: number
  amount: number
  date: string
  type: 'income' | 'expense' | 'transfer'
}

interface Category {
  id: number
  name: string
  color: string
}

interface CategoryPeriodData {
  values: Record<string, number>
  total: number
  categoryName: string
}

interface MatrixData {
  [categoryId: number]: CategoryPeriodData
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

    const expenseTransactions = transactions.filter((t: Transaction) => t.type === 'expense')

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

    expenseTransactions.forEach((transaction: Transaction) => {
      const transactionDate = new Date(transaction.date)
      const period = transactionDate.toLocaleDateString('en-US', { 
        month: 'short', 
        year: '2-digit' 
      }).toUpperCase()

      if (matrix[transaction.category_id] && newPeriods.includes(period)) {
        matrix[transaction.category_id].values[period] += Number(transaction.amount)
        matrix[transaction.category_id].total += Number(transaction.amount)
      }
    })

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

  const getSortedCategories = (): number[] => {
    const categoryIds = Object.keys(matrixData).map(Number)
    
    if (!sortColumn || !sortOrder) {
      return categoryIds.sort((a, b) => 
        matrixData[a].categoryName.localeCompare(matrixData[b].categoryName)
      )
    }

    return categoryIds.sort((a, b) => {
      let valueA: number
      let valueB: number

      if (sortColumn === 'total') {
        valueA = matrixData[a].total
        valueB = matrixData[b].total
      } else {
        valueA = matrixData[a].values[sortColumn] || 0
        valueB = matrixData[b].values[sortColumn] || 0
      }

      if (sortOrder === 'asc') {
        return valueA - valueB
      } else {
        return valueB - valueA
      }
    })
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
        {Object.keys(matrixData).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No transaction data available for matrix analysis.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
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
                {sortedCategoryIds.map(categoryId => {
                  const categoryData = matrixData[categoryId]
                  if (categoryData.total === 0) return null
                  
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

