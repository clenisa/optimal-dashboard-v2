"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ProviderStatus, AIProviderId } from '@/lib/ai/types'
import { aiService } from '@/lib/ai/service'
import { logger } from '@/lib/logger'
import type { ProviderOption } from '@/lib/ai/chat/types'
import { DEFAULT_PROVIDER, resolveInitialModel } from '@/lib/ai/chat/providers'

interface UseAiChatProvidersResult {
  providers: ProviderOption[]
  providerStatus: Record<string, ProviderStatus>
  activeProvider: AIProviderId
  activeModel?: string
  modelSelections: Record<string, string>
  setActiveProvider: (provider: AIProviderId) => void
  selectModel: (providerId: AIProviderId, modelId: string) => void
  refreshStatuses: () => Promise<void>
}

const STATUS_REFRESH_INTERVAL = 15_000
const PREFERRED_PROVIDER_STORAGE_KEY = 'preferred-ai-provider'

export function useAiChatProviders(): UseAiChatProvidersResult {
  const [providers, setProviders] = useState<ProviderOption[]>([])
  const [providerStatus, setProviderStatus] = useState<Record<string, ProviderStatus>>({})
  const [activeProvider, setActiveProviderState] = useState<AIProviderId>('ollama')
  const [modelSelections, setModelSelections] = useState<Record<string, string>>({})
  const mountedRef = useRef(true)

  const persistPreferredProvider = useCallback((provider: AIProviderId) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PREFERRED_PROVIDER_STORAGE_KEY, provider)
    }
  }, [])

  const initializeProviders = useCallback(async () => {
    try {
      const providerList = await aiService.listProviders()
      if (!mountedRef.current) return

      setProviders(providerList)

      const initialSelections: Record<string, string> = {}
      providerList.forEach((provider) => {
        const defaultModel = resolveInitialModel(provider)
        if (defaultModel) {
          initialSelections[provider.id] = defaultModel
        }
      })
      setModelSelections((prev) => ({ ...initialSelections, ...prev }))

      const savedProvider =
        typeof window !== 'undefined'
          ? (window.localStorage.getItem(PREFERRED_PROVIDER_STORAGE_KEY) as AIProviderId | null)
          : null

      const preferredFromStorage = savedProvider
        ? providerList.find((provider) => provider.id === savedProvider)
        : undefined
      const preferredDefault = providerList.find((provider) => provider.id === DEFAULT_PROVIDER)
      const fallback = providerList[0]

      const nextProvider =
        preferredFromStorage?.id ?? preferredDefault?.id ?? fallback?.id

      if (nextProvider) {
        setActiveProviderState(nextProvider)
        persistPreferredProvider(nextProvider)
      }
    } catch (error) {
      logger.error('AiChatProviders', 'Failed to load providers', error)
    }
  }, [persistPreferredProvider])

  const refreshStatuses = useCallback(async () => {
    if (providers.length === 0) return

    try {
      const statuses = await Promise.all(
        providers.map(async (provider) => {
          try {
            const status = await aiService.getProviderStatus(provider.id)
            return [provider.id, status] as const
          } catch (error) {
            logger.warn('AiChatProviders', 'Provider status fetch failed', {
              provider: provider.id,
              error,
            })
            return [provider.id, { ok: false, error: 'Status unavailable' }] as const
          }
        }),
      )

      if (mountedRef.current) {
        setProviderStatus(Object.fromEntries(statuses))
      }
    } catch (error) {
      logger.warn('AiChatProviders', 'Failed to refresh provider statuses', error)
    }
  }, [providers])

  useEffect(() => {
    initializeProviders()
    return () => {
      mountedRef.current = false
    }
  }, [initializeProviders])

  useEffect(() => {
    if (providers.length === 0) return

    const interval = window.setInterval(() => {
      void refreshStatuses()
    }, STATUS_REFRESH_INTERVAL)

    void refreshStatuses()

    return () => {
      window.clearInterval(interval)
    }
  }, [providers, refreshStatuses])

  const activeModel = useMemo(() => modelSelections[activeProvider], [modelSelections, activeProvider])

  const selectModel = useCallback((providerId: AIProviderId, modelId: string) => {
    setModelSelections((prev) => ({ ...prev, [providerId]: modelId }))
  }, [])

  const setActiveProvider = useCallback(
    (provider: AIProviderId) => {
      setActiveProviderState(provider)
      persistPreferredProvider(provider)
    },
    [persistPreferredProvider],
  )

  return {
    providers,
    providerStatus,
    activeProvider,
    activeModel,
    modelSelections,
    setActiveProvider,
    selectModel,
    refreshStatuses,
  }
}
