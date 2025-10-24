"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, BarChart3 } from "lucide-react"
import { useFinancialData } from '@/hooks/useFinancialData'
import type { CategoryData, TransactionData } from '@/lib/chart-data'
import { cn } from '@/lib/utils'
import { SPACING_TOKENS, SURFACE_TOKENS, TYPOGRAPHY_TOKENS } from '@/lib/design-tokens'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CategoryPeriodData {
  values: Record<string, number>
  total: number
  categoryName: string
}

interface MatrixData {
  [categoryName: string]: CategoryPeriodData
}

type ViewType = '6months' | '12months' | 'currentYear'
type SortOrder = 'asc' | 'desc' | null

export function CategoryMatrix() {
  const { transactions, categories, loading, error, reload } = useFinancialData()
  const [matrixData, setMatrixData] = useState<MatrixData>({})
  const [periods, setPeriods] = useState<string[]>([])
  const [viewType, setViewType] = useState<ViewType>('6months')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [scrollShadows, setScrollShadows] = useState({ left: false, right: false })

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

  const updateMatrix = useCallback(() => {
    const newPeriods = generatePeriods(viewType)
    setPeriods(newPeriods)

    // Fixed expense filtering - only include transactions explicitly marked as 'expense'
    const expenseTransactions = transactions.filter((t: TransactionData) => t.type === 'expense')

    const matrix: MatrixData = {}

    // Build a set of category names from both provided categories and transactions
    const categoryNameSet = new Set<string>()
    categories.forEach((cat: CategoryData) => {
      if (cat?.category) categoryNameSet.add(cat.category)
    })
    expenseTransactions.forEach((txn: TransactionData) => {
      const catName = txn.category || 'Uncategorized'
      categoryNameSet.add(catName)
    })

    const categoryNames = Array.from(categoryNameSet)

    categoryNames.forEach((categoryName: string) => {
      matrix[categoryName] = {
        categoryName,
        total: 0,
        values: {}
      }
      newPeriods.forEach((period: string) => {
        matrix[categoryName].values[period] = 0
      })
    })

    expenseTransactions.forEach((transaction: TransactionData) => {
      const transactionDate = new Date(transaction.date)
      const period = transactionDate.toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit'
      }).toUpperCase()

      const categoryName = transaction.category || 'Uncategorized'
      if (matrix[categoryName] && newPeriods.includes(period)) {
        const amount = Math.abs(Number(transaction.amount) || 0)
        matrix[categoryName].values[period] += amount
        matrix[categoryName].total += amount
      }
    })

    setMatrixData(matrix)
  }, [categories, transactions, viewType])

  useEffect(() => {
    if (transactions.length > 0 && categories.length > 0) {
      updateMatrix()
    }
  }, [transactions, categories, updateMatrix])

  const updateScrollIndicators = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return
    const { scrollLeft, scrollWidth, clientWidth } = container
    const maxScrollLeft = Math.max(0, scrollWidth - clientWidth)
    setScrollShadows({
      left: scrollLeft > 0,
      right: scrollLeft < maxScrollLeft - 1,
    })
  }, [])

  useEffect(() => {
    updateScrollIndicators()
    const container = scrollContainerRef.current
    container?.addEventListener('scroll', updateScrollIndicators)
    window.addEventListener('resize', updateScrollIndicators)

    return () => {
      container?.removeEventListener('scroll', updateScrollIndicators)
      window.removeEventListener('resize', updateScrollIndicators)
    }
  }, [updateScrollIndicators])

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
    const categoryNames = Object.keys(matrixData)

    const validCategoryNames = categoryNames.filter((name: string) =>
      Boolean(matrixData[name]) && matrixData[name].categoryName !== undefined
    )

    if (!sortColumn || !sortOrder) {
      return validCategoryNames.sort((a: string, b: string) => {
        const categoryA = matrixData[a]
        const categoryB = matrixData[b]

        if (!categoryA || !categoryB) return 0
        if (!categoryA.categoryName || !categoryB.categoryName) return 0

        return categoryA.categoryName.localeCompare(categoryB.categoryName)
      })
    }

    return validCategoryNames.sort((a: string, b: string) => {
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
  }

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return null
    if (sortOrder === 'asc') return <ChevronUp className="h-4 w-4" />
    if (sortOrder === 'desc') return <ChevronDown className="h-4 w-4" />
    return null
  }

  const getAriaSort = (column: string): "none" | "ascending" | "descending" => {
    if (sortColumn !== column || !sortOrder) return "none"
    return sortOrder === 'asc' ? 'ascending' : 'descending'
  }

  if (loading) {
    return (
      <Card className={cn('border', SURFACE_TOKENS.primary)}>
        <CardHeader>
          <CardTitle>Category Matrix</CardTitle>
        </CardHeader>
        <CardContent className={SPACING_TOKENS.card}>
          <LoadingSkeleton lines={8} />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn('border', SURFACE_TOKENS.primary)}>
        <CardHeader>
          <CardTitle>Category Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert
            variant="destructive"
            aria-live="assertive"
            className={cn('border', SURFACE_TOKENS.primary, 'border-destructive/40')}
          >
            <AlertDescription>{error}</AlertDescription>
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={() => void reload()}>
                Retry analysis
              </Button>
            </div>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const sortedCategoryNames = getSortedCategories()

  return (
    <Card className={cn('border', SURFACE_TOKENS.primary)}>
      <CardHeader className="gap-3">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Category Matrix
        </CardTitle>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={cn(TYPOGRAPHY_TOKENS.subheading, 'font-medium text-foreground')}>View:</span>
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
      <CardContent className={cn(SPACING_TOKENS.section)}>
        {Object.keys(matrixData).length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No transaction data available for matrix analysis.
          </div>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {sortedCategoryNames.map((categoryName) => {
                const categoryData = matrixData[categoryName]
                if (!categoryData) return null

                return (
                  <div
                    key={categoryName}
                    className={cn('rounded-lg border', SURFACE_TOKENS.primary, SPACING_TOKENS.compact)}
                  >
                    <div className={cn(TYPOGRAPHY_TOKENS.heading)}>{categoryData.categoryName}</div>
                    <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      {periods.map((period) => (
                        <div key={period}>
                          <dt className={TYPOGRAPHY_TOKENS.caption}>{period}</dt>
                          <dd className="font-medium">{formatCurrency(categoryData.values[period] || 0)}</dd>
                        </div>
                      ))}
                      <div className="col-span-2 border-t border-border/60 pt-2">
                        <dt className={cn(TYPOGRAPHY_TOKENS.caption, 'uppercase tracking-wide')}>Total</dt>
                        <dd className="text-base font-semibold">{formatCurrency(categoryData.total)}</dd>
                      </div>
                    </dl>
                  </div>
                )
              })}
            </div>

            <div className="relative hidden md:block">
              {scrollShadows.left && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-card to-transparent"
                />
              )}
              {scrollShadows.right && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-card to-transparent"
                />
              )}
              <div
                ref={scrollContainerRef}
                className="overflow-x-auto"
                aria-label="Category spend matrix"
              >
                <table key={`matrix-${Object.keys(matrixData).length}-${JSON.stringify(periods)}`} className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="sticky left-0 z-10 bg-card p-3 text-left font-medium" aria-sort="none">
                        Category
                      </th>
                      {periods.map((period: string) => (
                        <th
                          key={period}
                          className="text-center p-3 font-medium"
                          aria-sort={getAriaSort(period)}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleColumnSort(period)}
                            className="flex h-auto items-center gap-1 p-1"
                            aria-pressed={sortColumn === period}
                          >
                            {period}
                            {getSortIcon(period)}
                          </Button>
                        </th>
                      ))}
                      <th className="text-center p-3 font-medium" aria-sort={getAriaSort('total')}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleColumnSort('total')}
                          className="flex h-auto items-center gap-1 p-1"
                          aria-pressed={sortColumn === 'total'}
                        >
                          Total
                          {getSortIcon('total')}
                        </Button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCategoryNames.map((categoryName: string) => {
                      const categoryData = matrixData[categoryName]
                      if (!categoryData) return null

                      return (
                        <tr key={categoryName} className="border-b hover:bg-muted/40">
                          <td className="sticky left-0 z-10 bg-card p-3 font-medium">
                            {categoryData.categoryName}
                          </td>
                          {periods.map((period: string) => (
                            <td key={period} className="p-3 text-center">
                              {formatCurrency(categoryData.values[period] || 0)}
                            </td>
                          ))}
                          <td className="p-3 text-center font-medium">
                            {formatCurrency(categoryData.total)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
