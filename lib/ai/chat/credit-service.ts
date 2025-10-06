import { createClient } from '@/lib/supabase-client'
import { logger } from '@/lib/logger'
import type { AIProviderId } from '@/lib/ai/types'
import type { UserCredits } from './types'

interface SpendCreditsArgs {
  userId: string
  amount: number
  conversationId: string
  provider: AIProviderId
  metadata?: Record<string, unknown>
  currentCredits?: UserCredits | null
}

export async function loadOrCreateCredits(userId: string): Promise<UserCredits | null> {
  try {
    const supabase = createClient()
    if (!supabase) return null

    const { data, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      logger.error('ChatCreditService', 'Failed to load user credits', error)
      return null
    }

    if (data) {
      return data
    }

    const { data: newCredits, error: insertError } = await supabase
      .from('user_credits')
      .insert({
        user_id: userId,
        total_credits: 10,
        total_earned: 10,
        last_daily_credit: new Date().toISOString().split('T')[0],
      })
      .select()
      .single()

    if (insertError) {
      logger.error('ChatCreditService', 'Failed to initialize user credits', insertError)
      return null
    }

    return newCredits
  } catch (error) {
    logger.error('ChatCreditService', 'Unexpected error loading credits', error)
    return null
  }
}

export async function awardDailyCredits(userId: string): Promise<UserCredits | null> {
  try {
    const supabase = createClient()
    if (!supabase) return null

    const today = new Date().toISOString().split('T')[0]

    const { data } = await supabase
      .from('user_credits')
      .select('last_daily_credit, daily_credit_amount, total_credits, total_earned')
      .eq('user_id', userId)
      .single()

    if (!data) {
      return null
    }

    if (data.last_daily_credit === today) {
      const refreshed = await loadOrCreateCredits(userId)
      return refreshed
    }

    const bonus = data.daily_credit_amount || 0
    const newTotalCredits = (data.total_credits || 0) + bonus
    const newTotalEarned = (data.total_earned || 0) + bonus

    const { data: updated, error: updateError } = await supabase
      .from('user_credits')
      .update({
        total_credits: newTotalCredits,
        total_earned: newTotalEarned,
        last_daily_credit: today,
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (updateError) {
      logger.error('ChatCreditService', 'Failed to update daily credits', updateError)
      return null
    }

    await supabase.from('credit_transactions').insert({
      user_id: userId,
      type: 'earned',
      amount: bonus,
      description: 'Daily login bonus',
    })

    return updated
  } catch (error) {
    logger.error('ChatCreditService', 'Unexpected error awarding daily credits', error)
    return null
  }
}

export async function spendCredits({
  userId,
  amount,
  conversationId,
  provider,
  metadata,
  currentCredits,
}: SpendCreditsArgs): Promise<UserCredits | null> {
  if (amount <= 0) {
    return currentCredits ?? null
  }

  try {
    const supabase = createClient()
    if (!supabase) return currentCredits ?? null

    const { data, error } = await supabase
      .from('user_credits')
      .update({
        total_credits: Math.max(0, (currentCredits?.total_credits || 0) - amount),
        total_spent: (currentCredits?.total_spent || 0) + amount,
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      logger.error('ChatCreditService', 'Failed to spend credits', error)
      return currentCredits ?? null
    }

    await supabase.from('credit_transactions').insert({
      user_id: userId,
      type: 'spent',
      amount: -amount,
      description: `AI chat (${provider})`,
      conversation_id: conversationId,
      metadata,
    })

    return data
  } catch (error) {
    logger.error('ChatCreditService', 'Unexpected error spending credits', error)
    return currentCredits ?? null
  }
}

export async function refundCredits(
  userId: string,
  amount: number,
  reason: string,
  currentCredits: UserCredits | null,
): Promise<UserCredits | null> {
  if (amount <= 0) {
    return currentCredits
  }

  try {
    const supabase = createClient()
    if (!supabase) return currentCredits

    const { data, error } = await supabase
      .from('user_credits')
      .update({
        total_credits: (currentCredits?.total_credits || 0) + amount,
        total_spent: Math.max(0, (currentCredits?.total_spent || 0) - amount),
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      logger.error('ChatCreditService', 'Failed to refund credits', error)
      return currentCredits
    }

    await supabase.from('credit_transactions').insert({
      user_id: userId,
      type: 'earned',
      amount,
      description: reason,
    })

    return data
  } catch (error) {
    logger.error('ChatCreditService', 'Unexpected error refunding credits', error)
    return currentCredits
  }
}
