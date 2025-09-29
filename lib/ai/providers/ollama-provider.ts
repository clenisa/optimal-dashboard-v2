import { logger } from '@/lib/logger'
import type {
  AIModel,
  ChatCompletionResult,
  ProviderMessageOptions,
  ProviderStatus
} from '../types'
import { AIProvider } from './base'

interface OllamaProviderMetadata {
  baseUrl: string
  defaultModel: string
}

export class OllamaProvider extends AIProvider {
  private readonly baseUrl: string
  private readonly defaultModel: string

  constructor(context: { config: { enabled: boolean; id: 'ollama'; name: string; metadata?: Record<string, unknown> } }) {
    super(context)

    const metadata = (context.config.metadata || {}) as Partial<OllamaProviderMetadata>
    this.baseUrl = metadata.baseUrl || process.env.NEXT_PUBLIC_ELECTRON_CONSOLE_URL || 'http://localhost:3000'
    this.defaultModel = metadata.defaultModel || 'llama3.1'
  }

  async getModels(): Promise<AIModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(4000)
      })

      if (!response.ok) {
        throw new Error(`Unexpected status ${response.status}`)
      }

      const data = await response.json()

      if (Array.isArray(data?.models)) {
        return data.models.map((model: any) => ({
          id: String(model.id || model.name),
          name: String(model.displayName || model.name || model.id),
          provider: 'ollama' as const,
          description: model.description,
          default: model.id === this.defaultModel
        }))
      }
    } catch (error) {
      logger.warn('OllamaProvider', 'Failed to fetch models from ElectronConsole, falling back to default', error)
    }

    return [
      {
        id: this.defaultModel,
        name: `Ollama (${this.defaultModel})`,
        provider: 'ollama',
        default: true,
        description: 'Local Ollama model served via ElectronConsole'
      }
    ]
  }

  async sendMessage({ request }: ProviderMessageOptions): Promise<ChatCompletionResult> {
    const latestMessage = request.messages[request.messages.length - 1]
    const conversationId =
      request.conversationId || `conv_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`

    const payload = {
      prompt: latestMessage?.content ?? '',
      userId: request.userId,
      userEmail: request.userEmail,
      conversationId,
      source: 'optimal-desktop',
      timestamp: new Date().toISOString(),
      includeFinancialContext: /budget|spending|expense|income|credit|transaction|financial|money|dollar|\$/i.test(
        latestMessage?.content ?? ''
      )
    }

    const response = await fetch(`${this.baseUrl}/prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`ElectronConsole error: ${response.status}`)
    }

    const result = await response.json()

    return {
      provider: 'ollama',
      model: request.model || this.defaultModel,
      message: {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: result.response || 'I received your message but had trouble generating a response.',
        done: true,
        thinking: result.thinking,
        gesture: result.gesture,
        metadata: {
          ...result.metadata,
          conversationId
        }
      }
    }
  }

  async checkStatus(): Promise<ProviderStatus> {
    const startedAt = Date.now()

    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      })

      return {
        ok: response.ok,
        latency: Date.now() - startedAt,
        error: response.ok ? undefined : `Status ${response.status}`
      }
    } catch (error: any) {
      return {
        ok: false,
        latency: Date.now() - startedAt,
        error: error?.message || 'Failed to connect to ElectronConsole'
      }
    }
  }
}
