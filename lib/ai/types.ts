export type AIProviderId = 'ollama' | 'openai'

export interface AIModel {
  id: string
  name: string
  provider: AIProviderId
  description?: string
  contextWindow?: number
  default?: boolean
  pricing?: {
    prompt: number
    completion: number
    unit: '1K_tokens' | '1M_tokens'
    currency: 'USD'
  }
}

export interface ProviderStatus {
  ok: boolean
  latency?: number
  error?: string
  details?: Record<string, unknown>
}

export interface ChatRoleMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionRequest {
  conversationId?: string
  provider: AIProviderId
  model: string
  userId?: string
  userEmail?: string | null
  messages: ChatRoleMessage[]
  metadata?: Record<string, unknown>
}

export interface ChatCompletionChunk {
  id: string
  role: 'assistant'
  content: string
  done: boolean
  thinking?: string[]
  gesture?: string
  metadata?: Record<string, unknown>
  usage?: TokenUsage
  costUSD?: number
}

export interface ChatCompletionResult {
  message: ChatCompletionChunk
  provider: AIProviderId
  model: string
}

export interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export interface ProviderConfig {
  id: AIProviderId
  name: string
  enabled: boolean
  defaultModel?: string
  supportsStreaming?: boolean
  metadata?: Record<string, unknown>
}

export interface ProviderInitializationContext {
  config: ProviderConfig
}

export interface ProviderMessageOptions {
  request: ChatCompletionRequest
  signal?: AbortSignal
}

export interface ConversationSummary {
  id: string
  title: string
  provider: AIProviderId
  model: string
  createdAt: string
  updatedAt: string
  metadata?: Record<string, unknown>
}

export interface ConversationMessage {
  id: string
  conversationId: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  metadata?: Record<string, unknown>
  provider?: AIProviderId
  model?: string
}

export interface ChatHistoryProvider {
  saveConversation: (conversation: ConversationSummary, messages: ConversationMessage[]) => Promise<void>
  loadConversations: (userId: string) => Promise<ConversationSummary[]>
  loadMessages: (conversationId: string) => Promise<ConversationMessage[]>
  deleteConversation: (conversationId: string) => Promise<void>
}

export interface CostBreakdown {
  provider: AIProviderId
  model: string
  costUSD: number
  usage?: TokenUsage
}
