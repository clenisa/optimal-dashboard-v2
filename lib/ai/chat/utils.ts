import { CREDIT_USD_VALUE } from './constants'

export function calculateCreditsFromUsd(usd?: number): number {
  if (!usd || usd <= 0) return 1
  return Math.max(1, Math.ceil(usd / CREDIT_USD_VALUE))
}

export function createConversationId(existingId?: string): string {
  if (existingId) return existingId
  return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}

export function generateMessageId(prefix: 'user' | 'assistant'): string {
  return `msg_${Date.now()}_${prefix}`
}
