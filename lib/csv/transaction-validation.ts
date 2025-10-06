import type { ParsedTransaction } from '@/lib/csv-parser'

export interface TransactionValidationResult {
  isValid: boolean
  errors: string[]
}

export interface BatchValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  processedCount: number
  skippedCount: number
}

const VALID_TRANSACTION_TYPES = ['income', 'expense', 'transfer']

export function validateTransaction(transaction: ParsedTransaction): TransactionValidationResult {
  const errors: string[] = []

  const transactionType = transaction.type?.toLowerCase().trim()
  if (!transactionType || !VALID_TRANSACTION_TYPES.includes(transactionType)) {
    errors.push(`Invalid transaction type: '${transaction.type}'. Must be one of: ${VALID_TRANSACTION_TYPES.join(', ')}`)
  }

  if (!transaction.amount || isNaN(Number(transaction.amount))) {
    errors.push(`Invalid amount: '${transaction.amount}'. Must be a valid number.`)
  } else if (Number(transaction.amount) === 0) {
    errors.push('Amount cannot be zero')
  }

  if (!transaction.date) {
    errors.push('Date is required')
  } else {
    const date = new Date(transaction.date)
    if (isNaN(date.getTime())) {
      errors.push(`Invalid date format: '${transaction.date}'`)
    } else if (date > new Date()) {
      errors.push(`Future date not allowed: '${transaction.date}'`)
    }
  }

  if (!transaction.description || transaction.description.trim().length === 0) {
    errors.push('Description is required')
  } else if (transaction.description.length > 255) {
    errors.push(`Description too long: ${transaction.description.length} characters (max 255)`)
  }

  if (transaction.category && transaction.category.length > 100) {
    errors.push(`Category name too long: ${transaction.category.length} characters (max 100)`)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateTransactions(transactions: ParsedTransaction[]): BatchValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  let validCount = 0
  let invalidCount = 0

  const duplicates = new Set<string>()
  const seen = new Set<string>()

  transactions.forEach((transaction, index) => {
    const key = `${transaction.date}-${transaction.amount}-${transaction.description}`
    if (seen.has(key)) {
      duplicates.add(key)
      warnings.push(`Duplicate transaction at row ${index + 1}: ${transaction.description}`)
    } else {
      seen.add(key)
    }

    const validation = validateTransaction(transaction)
    if (!validation.isValid) {
      invalidCount += 1
      errors.push(
        `Row ${index + 1} errors: ${validation.errors.join('; ')}`,
      )
    } else {
      validCount += 1
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    processedCount: validCount,
    skippedCount: invalidCount,
  }
}
