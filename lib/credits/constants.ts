import type { CreditPackage } from '@/lib/credits/types'

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 50,
    price: 4.99,
  },
  {
    id: 'popular',
    name: 'Popular Pack',
    credits: 150,
    price: 12.99,
    popular: true,
    bonus: 25,
  },
  {
    id: 'power',
    name: 'Power User',
    credits: 300,
    price: 24.99,
    bonus: 75,
  },
  {
    id: 'unlimited',
    name: 'Monthly Unlimited',
    credits: 1000,
    price: 49.99,
    bonus: 200,
  },
]

export const CREDIT_RETRY_MAX_ATTEMPTS = 3
export const CREDIT_CACHE_TTL_MS = 2 * 60 * 1000
