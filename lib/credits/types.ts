export interface UserCredits {
  total_credits: number
  total_earned: number
  total_spent: number
  last_daily_credit: string
  daily_credit_amount?: number
}

export type CreditTransactionType = 'earned' | 'spent' | 'purchased' | 'daily_bonus'

export interface CreditTransaction {
  id: string
  type: CreditTransactionType
  amount: number
  description: string
  created_at: string
  stripe_payment_intent_id?: string
}

export interface CreditPackage {
  id: string
  name: string
  credits: number
  price: number
  popular?: boolean
  bonus?: number
}
