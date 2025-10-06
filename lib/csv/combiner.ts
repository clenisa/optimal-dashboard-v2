import type { ParsedTransaction } from '@/lib/csv-parser'
import type { CombinedResult } from './types'

export function combineTransactions(files: ParsedTransaction[][], startTime: number): CombinedResult {
  const allTransactions = files.flat()
  if (allTransactions.length === 0) {
    throw new Error('No transactions available to combine')
  }

  const uniqueTransactions: ParsedTransaction[] = []
  const seen = new Set<string>()
  let duplicatesRemoved = 0

  for (const transaction of allTransactions) {
    const key = `${transaction.date}-${transaction.amount}-${transaction.description.trim().toLowerCase()}`
    if (!seen.has(key)) {
      seen.add(key)
      uniqueTransactions.push(transaction)
    } else {
      duplicatesRemoved += 1
    }
  }

  uniqueTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const processingTime = Date.now() - startTime

  return {
    transactions: uniqueTransactions,
    summary: {
      totalFiles: files.length,
      totalTransactions: uniqueTransactions.length,
      duplicatesRemoved,
      processingTime,
    },
  }
}
