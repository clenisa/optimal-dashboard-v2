import { createClient } from '@/lib/supabase-client'
import { logger } from '@/lib/logger'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AIProviderId } from '@/lib/ai/types'
import type { UserCredits } from './types'
import { getCurrentESTDate } from '@/lib/timezone-utils'

const DEFAULT_DAILY_CREDIT_AMOUNT = 50
type GenericSupabaseClient = SupabaseClient<any, any, any>

interface SpendCreditsArgs {
  userId: string
  amount: number
  conversationId: string
  provider: AIProviderId
  metadata?: Record<string, unknown>
  currentCredits?: UserCredits | null
}

export async function loadOrCreateCredits(
  userId: string,
  client?: GenericSupabaseClient,
): Promise<UserCredits | null> {
  try {
    const supabase = (client ?? createClient()) as GenericSupabaseClient | null
    if (!supabase) return null
    const todayEST = getCurrentESTDate()

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
        daily_credit_amount: DEFAULT_DAILY_CREDIT_AMOUNT,
        last_daily_credit: todayEST,
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

interface ClaimDailyCreditsResult {
  awarded: boolean
  amount: number
  claimDate: string
  credits: UserCredits | null
  previousLastClaimDate: string | null
}

export async function claimDailyCredits(
  userId: string,
  client?: GenericSupabaseClient,
): Promise<ClaimDailyCreditsResult | null> {
  try {
    const supabase = (client ?? createClient()) as GenericSupabaseClient | null
    if (!supabase) return null

    const todayEST = getCurrentESTDate()
    const existingCredits = await loadOrCreateCredits(userId, supabase)

    if (!existingCredits) {
      return null
    }

    const previousLastClaimDate = existingCredits.last_daily_credit ?? null

    if (previousLastClaimDate === todayEST) {
      return {
        awarded: false,
        amount: 0,
        claimDate: todayEST,
        credits: existingCredits,
        previousLastClaimDate,
      }
    }

    const bonus = existingCredits.daily_credit_amount ?? DEFAULT_DAILY_CREDIT_AMOUNT
    const newTotalCredits = (existingCredits.total_credits || 0) + bonus
    const newTotalEarned = (existingCredits.total_earned || 0) + bonus

    const { data: updated, error: updateError } = await supabase
      .from('user_credits')
      .update({
        total_credits: newTotalCredits,
        total_earned: newTotalEarned,
        last_daily_credit: todayEST,
      })
      .eq('user_id', userId)
      .or(`last_daily_credit.is.null,last_daily_credit.lt.${todayEST}`)
      .select()
      .single()

    if (updateError && updateError.code !== 'PGRST116') {
      logger.error('ChatCreditService', 'Failed to update daily credits', updateError)
      return null
    }

    if (!updated) {
      return {
        awarded: false,
        amount: 0,
        claimDate: todayEST,
        credits: existingCredits,
        previousLastClaimDate,
      }
    }

    const { error: transactionError } = await supabase.from('credit_transactions').insert({
      user_id: userId,
      type: 'daily_bonus',
      amount: bonus,
      description: `Daily free credits claimed (${todayEST})`,
    })

    if (transactionError) {
      logger.error('ChatCreditService', 'Failed to record daily bonus transaction', transactionError)
    }

    return {
      awarded: true,
      amount: bonus,
      claimDate: todayEST,
      credits: updated,
      previousLastClaimDate,
    }
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
