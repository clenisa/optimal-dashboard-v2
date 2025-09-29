import { logger } from '@/lib/logger'
import type {
  AIModel,
  ChatCompletionResult,
  ProviderMessageOptions,
  ProviderStatus,
  TokenUsage
} from '../types'
import { AIProvider } from './base'

const DEFAULT_MODEL = 'gpt-4o-mini'

const MODEL_PRICING: Record<string, { prompt: number; completion: number }> = {
  'gpt-4o-mini': { prompt: 0.00015, completion: 0.0006 },
  'gpt-4o': { prompt: 0.0005, completion: 0.0015 },
  'gpt-3.5-turbo': { prompt: 0.0005, completion: 0.0015 }
}

export class OpenAIProvider extends AIProvider {
  private readonly apiKey: string
  private readonly apiUrl: string

  constructor(context: { config: { enabled: boolean; id: 'openai'; name: string; metadata?: Record<string, unknown> } }) {
    super(context)

    this.apiKey = process.env.OPENAI_API_KEY || ''
    this.apiUrl = 'https://api.openai.com/v1/chat/completions'

    if (!this.apiKey) {
      logger.warn('OpenAIProvider', 'OPENAI_API_KEY not configured; provider will be disabled')
    }
  }

  async getModels(): Promise<AIModel[]> {
    const models = Object.keys(MODEL_PRICING).map<AIModel>((modelId, index) => ({
      id: modelId,
      name: modelId,
      provider: 'openai',
      default: modelId === (this.config.defaultModel || DEFAULT_MODEL),
      pricing: {
        prompt: MODEL_PRICING[modelId].prompt,
        completion: MODEL_PRICING[modelId].completion,
        unit: '1K_tokens',
        currency: 'USD'
      },
      description: index === 0 ? 'Fast and capable model suitable for financial insights' : undefined
    }))

    return models
  }

  async sendMessage({ request }: ProviderMessageOptions): Promise<ChatCompletionResult> {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY not configured')
    }

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: request.model || this.config.defaultModel || DEFAULT_MODEL,
        messages: request.messages,
        temperature: 0.7,
        user: request.userId || undefined
      })
    })

    if (!response.ok) {
      const errorBody = await response.text()
      logger.error('OpenAIProvider', 'OpenAI API error', { status: response.status, body: errorBody })
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const result = await response.json()

    const messageContent = result?.choices?.[0]?.message?.content ||
      'I received your message but had trouble generating a response.'

    const usage: TokenUsage | undefined = result?.usage
      ? {
          promptTokens: result.usage.prompt_tokens,
          completionTokens: result.usage.completion_tokens,
          totalTokens: result.usage.total_tokens
        }
      : undefined

    const model = request.model || result?.model || this.config.defaultModel || DEFAULT_MODEL

    return {
      provider: 'openai',
      model,
      message: {
        id: result?.id || `assistant_${Date.now()}`,
        role: 'assistant',
        content: messageContent,
        done: true,
        metadata: {
          conversationId: request.conversationId,
          openaiResponseId: result?.id
        },
        usage,
        costUSD: usage ? this.calculateCost(model, usage) : undefined
      }
    }
  }

  async checkStatus(): Promise<ProviderStatus> {
    if (!this.apiKey) {
      return { ok: false, error: 'OPENAI_API_KEY missing' }
    }

    // Minimal status check by hitting models endpoint with head request
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: { Authorization: `Bearer ${this.apiKey}` },
        signal: AbortSignal.timeout(3000)
      })

      return { ok: response.ok, error: response.ok ? undefined : `Status ${response.status}` }
    } catch (error: any) {
      return { ok: false, error: error?.message || 'Failed to reach OpenAI API' }
    }
  }

  private calculateCost(model: string, usage: TokenUsage): number {
    const pricing = MODEL_PRICING[model] || MODEL_PRICING[DEFAULT_MODEL]
    const promptCost = (usage.promptTokens / 1000) * pricing.prompt
    const completionCost = (usage.completionTokens / 1000) * pricing.completion
    return Number((promptCost + completionCost).toFixed(6))
  }
}
