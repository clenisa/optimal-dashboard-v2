import type { AIProviderId, ConversationMessage } from '@/lib/ai/types'
import type { ChatMessage } from './types'

export function mapConversationMessages(
  messages: ConversationMessage[],
  fallback: { provider: AIProviderId; model?: string },
): ChatMessage[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role,
    content: message.content,
    timestamp: new Date(message.createdAt),
    provider: (message.provider || fallback.provider) as AIProviderId,
    model: message.model || fallback.model || '',
    metadata: message.metadata || {},
  }))
}
