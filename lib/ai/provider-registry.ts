import { cache } from 'react'
import { logger } from '@/lib/logger'
import { AIProvider } from './providers/base'
import { OllamaProvider } from './providers/ollama-provider'
import { OpenAIProvider } from './providers/openai-provider'
import type { AIProviderId, ProviderConfig } from './types'

const registryCache = new Map<string, ProviderRegistry>()

const DEFAULT_CONFIG: Record<AIProviderId, ProviderConfig> = {
  ollama: {
    id: 'ollama',
    name: 'Local Ollama',
    enabled: process.env.NEXT_PUBLIC_ENABLE_OLLAMA === 'true' || process.env.NEXT_PUBLIC_ENABLE_OLLAMA === undefined,
    defaultModel: 'llama3.1',
    metadata: {
      baseUrl: process.env.NEXT_PUBLIC_ELECTRON_CONSOLE_URL || 'http://localhost:3000',
      defaultModel: 'llama3.1'
    }
  },
  openai: {
    id: 'openai',
    name: 'OpenAI ChatGPT',
    enabled: process.env.NEXT_PUBLIC_ENABLE_OPENAI === 'true',
    defaultModel: process.env.NEXT_PUBLIC_OPENAI_DEFAULT_MODEL || 'gpt-4o-mini'
  }
}

export class ProviderRegistry {
  private providers: Map<AIProviderId, AIProvider>

  constructor(config: Partial<Record<AIProviderId, ProviderConfig>> = {}) {
    this.providers = new Map()

    const mergedConfig = {
      ...DEFAULT_CONFIG,
      ...config
    }

    Object.entries(mergedConfig).forEach(([id, cfg]) => {
      const typedId = id as AIProviderId
      if (!cfg?.enabled) {
        logger.info('ProviderRegistry', `${cfg?.name || id} provider disabled via configuration`)
        return
      }

      let provider: AIProvider | null = null

      if (typedId === 'ollama') {
        provider = new OllamaProvider({ config: cfg })
      }

      if (typedId === 'openai') {
        provider = new OpenAIProvider({ config: cfg })
      }

      if (provider) {
        this.providers.set(typedId, provider)
      }
    })
  }

  getProvider(id: AIProviderId): AIProvider | undefined {
    return this.providers.get(id)
  }

  listProviders(): ProviderConfig[] {
    return Array.from(this.providers.values()).map((provider) => ({
      id: provider.id,
      name: provider.name,
      enabled: provider.enabled,
      defaultModel: provider.config.defaultModel,
      supportsStreaming: false
    }))
  }
}

export const getProviderRegistry = cache(() => {
  const key = 'default'
  if (!registryCache.has(key)) {
    registryCache.set(key, new ProviderRegistry())
  }
  return registryCache.get(key)!
})
