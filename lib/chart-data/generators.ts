import type { CategoryData, PaymentSourceData, TransactionData } from './fetchers'
import { categoryColors } from './constants'

export function generateCategoryData(categories: CategoryData[]) {
  const labels = categories.map((cat) => cat.category)
  const amounts = categories.map((cat) => cat.amount)

  return {
    labels,
    datasets: [
      {
        label: 'Amount Spent',
        data: amounts,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
    ],
  }
}

export function generateMultiCategoryData(transactions: TransactionData[], categories: CategoryData[]) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const categoryData: Record<string, number[]> = {}

  categories.forEach((cat) => {
    categoryData[cat.category] = new Array(12).fill(0)
  })

  transactions.forEach((txn) => {
    if (!txn?.date) return
    const date = new Date(txn.date)
    const monthIndex = date.getMonth()
    if (Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) return

    const amount = Math.abs(Number(txn.amount) || 0)
    const categoryName = txn.category || 'Uncategorized'

    if (categoryData[categoryName]) {
      categoryData[categoryName][monthIndex] += amount
    }
  })

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
        label: 'Balance',
        data: balances,
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
      {
        type: 'line' as const,
        label: 'Warning Threshold',
        data: Array(labels.length).fill(threshold),
        borderColor: 'rgba(255, 0, 0, 0.8)',
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
      },
    ],
  }
}
