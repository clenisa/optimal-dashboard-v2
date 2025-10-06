"use client"

import { useCallback, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import type { AIProviderId } from '@/lib/ai/types'
import type { UserCredits } from '@/lib/ai/chat/types'
import {
  awardDailyCredits,
  loadOrCreateCredits,
  refundCredits,
  spendCredits,
} from '@/lib/ai/chat/credit-service'

interface UseAiChatCreditsResult {
  credits: UserCredits | null
  loadCredits: (userId: string) => Promise<UserCredits | null>
  grantDailyCredits: (userId: string) => Promise<UserCredits | null>
  spend: (args: {
    userId: string
    amount: number
    conversationId: string
    provider: AIProviderId
    metadata?: Record<string, unknown>
  }) => Promise<UserCredits | null>
  refund: (args: { userId: string; amount: number; reason: string }) => Promise<UserCredits | null>
  reset: () => void
}

export function useAiChatCredits(user: User | null): UseAiChatCreditsResult {
  const [credits, setCredits] = useState<UserCredits | null>(null)

  const loadCredits = useCallback(async (userId: string) => {
    const next = await loadOrCreateCredits(userId)
    if (next) {
      setCredits(next)
    }
    return next
  }, [])

  const grantDailyCredits = useCallback(async (userId: string) => {
    const updated = await awardDailyCredits(userId)
    if (updated) {
      setCredits(updated)
      return updated
    }

    // Fall back to existing credits to avoid wiping state.
    const refreshed = await loadOrCreateCredits(userId)
    if (refreshed) {
      setCredits(refreshed)
    }
    return refreshed
  }, [])

  const spend = useCallback(
    async ({ userId, amount, conversationId, provider, metadata }: {
      userId: string
      amount: number
      conversationId: string
      provider: AIProviderId
      metadata?: Record<string, unknown>
    }) => {
      const updated = await spendCredits({
        userId,
        amount,
        conversationId,
        provider,
        metadata,
        currentCredits: credits,
      })
      if (updated) {
        setCredits(updated)
      }
      return updated
    },
    [credits],
  )

  const refund = useCallback(
    async ({ userId, amount, reason }: { userId: string; amount: number; reason: string }) => {
      const updated = await refundCredits(userId, amount, reason, credits)
      if (updated) {
        setCredits(updated)
      }
      return updated
    },
    [credits],
  )

  const reset = useCallback(() => {
    setCredits(null)
  }, [])

  useEffect(() => {
    if (!user) {
      setCredits(null)
    }
  }, [user])

  return {
    credits,
    loadCredits,
    grantDailyCredits,
    spend,
    refund,
    reset,
  }
}
