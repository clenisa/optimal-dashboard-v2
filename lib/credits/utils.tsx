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
      return <Gift className="w-4 h-4 text-green-600" />
    case 'purchased':
      return <CreditCard className="w-4 h-4 text-blue-600" />
    case 'spent':
      return <DollarSign className="w-4 h-4 text-orange-600" />
    default:
      return <History className="w-4 h-4 text-gray-600" />
  }
}

export function getTransactionColor(type: CreditTransactionType): string {
  switch (type) {
    case 'earned':
    case 'daily_bonus':
    case 'purchased':
      return 'text-green-600'
    case 'spent':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

export function getStatusIcon() {
  return <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
}
