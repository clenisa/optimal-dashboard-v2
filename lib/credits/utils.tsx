import { AlertCircle, CreditCard, DollarSign, Gift, History } from 'lucide-react'
import type { CreditTransactionType } from '@/lib/credits/types'

export function formatCreditTimestamp(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getTransactionIcon(type: CreditTransactionType) {
  switch (type) {
    case 'earned':
    case 'daily_bonus':
      return <Gift className="h-4 w-4 text-emerald-500 dark:text-emerald-300" />
    case 'purchased':
      return <CreditCard className="h-4 w-4 text-primary" />
    case 'spent':
      return <DollarSign className="h-4 w-4 text-rose-500 dark:text-rose-400" />
    default:
      return <History className="h-4 w-4 text-muted-foreground" />
  }
}

export function getTransactionColor(type: CreditTransactionType): string {
  switch (type) {
    case 'earned':
    case 'daily_bonus':
    case 'purchased':
      return 'text-emerald-600 dark:text-emerald-400'
    case 'spent':
      return 'text-rose-500 dark:text-rose-400'
    default:
      return 'text-muted-foreground'
  }
}

export function getStatusIcon() {
  return <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground/60" />
}
