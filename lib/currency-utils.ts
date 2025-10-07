/**
 * Formats a number as currency using accounting format
 * Negative numbers are displayed in parentheses: (1,234.56)
 * Positive numbers are displayed normally: 1,234.56
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    signDisplay: 'never', // We'll handle negative signs manually
  }).format(Math.abs(amount))
}

/**
 * Formats a number as currency using accounting format with parentheses for negative values
 * Negative numbers: ($1,234.56)
 * Positive numbers: $1,234.56
 */
export function formatCurrencyAccounting(amount: number): string {
  if (amount < 0) {
    return `(${formatCurrency(amount)})`
  }
  return formatCurrency(amount)
}

/**
 * Formats a number as currency for display in tables and summaries
 * Uses accounting format with proper color coding
 */
export function formatCurrencyDisplay(amount: number): string {
  return formatCurrencyAccounting(amount)
}