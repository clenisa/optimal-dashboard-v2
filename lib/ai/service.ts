'use client'

import { logger } from '@/lib/logger'
import type {
  AIModel,
  AIProviderId,
  ChatCompletionRequest,
  ChatCompletionResult,
  ProviderStatus,
  ConversationMessage,
  ConversationSummary
} from './types'
import { SupabaseChatHistory } from './chat-history'
import type { ChatCompletionChunk } from './types'

interface SendMessageOptions {
  provider: AIProviderId
  model: string
  messages: ChatCompletionRequest['messages']
  userId?: string
  userEmail?: string | null
  conversationId?: string
  metadata?: Record<string, unknown>
}

interface SendMessageResponse {
  result: ChatCompletionResult
  conversation: ConversationSummary
  messages: ConversationMessage[]
}

const historyProvider = new SupabaseChatHistory()

export class AIService {
  private readonly history = historyProvider

  async listProviders() {
    const response = await fetch('/api/ai/providers', { method: 'GET', cache: 'no-store' })
    if (!response.ok) {
      throw new Error('Failed to load AI providers')
    }

    const data = await response.json()
    return data.providers as Array<{ id: AIProviderId; name: string; defaultModel?: string; models: AIModel[] }>
  }

  async getProviderStatus(provider: AIProviderId): Promise<ProviderStatus> {
    const response = await fetch(`/api/ai/status?provider=${provider}`, { method: 'GET', cache: 'no-store' })
    if (!response.ok) {
      throw new Error('Failed to fetch provider status')
    }

    const data = await response.json()
    return data.status as ProviderStatus
  }

  async sendMessage(options: SendMessageOptions): Promise<SendMessageResponse> {
    const payload: ChatCompletionRequest = {
      provider: options.provider,
      model: options.model,
      userId: options.userId,
      userEmail: options.userEmail,
      conversationId: options.conversationId,
      messages: options.messages,
      metadata: options.metadata
    }

    const result = await this.dispatchRequest(payload)

    const metadataConversationId =
      typeof result.message.metadata?.conversationId === 'string'
        ? result.message.metadata.conversationId
        : undefined

    const conversationId = options.conversationId ?? metadataConversationId ?? `conv_${Date.now()}`
    const now = new Date().toISOString()

    const userMessageContent = options.messages[options.messages.length - 1]?.content ?? ''

    const conversation: ConversationSummary = {
      id: conversationId,
      title: userMessageContent.slice(0, 64) || 'New conversation',
      provider: options.provider,
      model: options.model,
      createdAt: now,
      updatedAt: now,
      metadata: { userId: options.userId, ...result.message.metadata }
    }

    const userMessage: ConversationMessage = {
      id: `user_${Date.now()}`,
      conversationId,
      role: 'user',
      content: options.messages[options.messages.length - 1]?.content ?? '',
      createdAt: now,
      metadata: { provider: options.provider, model: options.model }
    }

    const assistantMessage: ConversationMessage = {
      id: result.message.id,
      conversationId,
      role: 'assistant',
      content: result.message.content,
      createdAt: now,
      metadata: result.message.metadata,
      provider: result.provider,
      model: result.model
    }

    try {
      await this.history.saveConversation(conversation, [userMessage, assistantMessage])
    } catch (error) {
      logger.error('AIService', 'Failed to persist chat history', error)
    }

    return {
      result,
      conversation,
      messages: [userMessage, assistantMessage]
    }
  }

  async loadHistory(userId: string) {
    return this.history.loadConversations(userId)
  }

  async loadConversationMessages(conversationId: string) {
    return this.history.loadMessages(conversationId)
  }

  async deleteConversation(conversationId: string) {
    return this.history.deleteConversation(conversationId)
  }

  private async dispatchRequest(payload: ChatCompletionRequest): Promise<ChatCompletionResult> {
    if (payload.provider === 'ollama') {
      return sendViaOllama(payload)
    }

    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorBody = await response.text()
      logger.error('AIService', 'Failed to send AI message', { status: response.status, errorBody })
      throw new Error(`AI request failed with status ${response.status}`)
    }

    return (await response.json()) as ChatCompletionResult
  }
}

export const aiService = new AIService()

async function sendViaOllama(payload: ChatCompletionRequest): Promise<ChatCompletionResult> {
  const baseUrl = process.env.NEXT_PUBLIC_ELECTRON_CONSOLE_URL || 'http://localhost:3000'
  const latestMessage = payload.messages[payload.messages.length - 1]
  const conversationId =
    payload.conversationId || `conv_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`

  const response = await fetch(`${baseUrl}/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: latestMessage?.content ?? '',
      userId: payload.userId,
      userEmail: payload.userEmail,
      conversationId,
      source: 'optimal-desktop',
      timestamp: new Date().toISOString(),
      includeFinancialContext: /budget|spending|expense|income|credit|transaction|financial|money|dollar|\$/i.test(
        latestMessage?.content ?? ''
      )
    })
  })

  if (!response.ok) {
    const errorBody = await response.text()
    logger.error('AIService', 'Ollama request failed', { status: response.status, errorBody })
    throw new Error(`ElectronConsole error: ${response.status}`)
  }

  const body = await response.json()

  const message: ChatCompletionChunk = {
    id: `assistant_${Date.now()}`,
    role: 'assistant',
    content: body.response || 'I received your message but had trouble generating a response.',
    done: true,
    thinking: body.thinking,
    gesture: body.gesture,
    metadata: {
      ...body.metadata,
      conversationId
    }
  }

  return {
    provider: 'ollama',
    model: payload.model,
    message
  }
}
