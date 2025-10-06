import type { AIModel, AIProviderId, ProviderStatus, ConversationSummary } from '@/lib/ai/types'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  provider: AIProviderId
  model: string
  metadata?: Record<string, unknown>
  costUSD?: number
  usageSummary?: string
  error?: boolean
}

export interface UserCredits {
  total_credits: number
  total_earned: number
  total_spent: number
  last_daily_credit: string
  daily_credit_amount?: number
}

export interface ProviderOption {
  id: AIProviderId
  name: string
  defaultModel?: string
  models: AIModel[]
}

export interface AiChatHistoryState {
  history: ConversationSummary[]
  selectedConversationId?: string
}
