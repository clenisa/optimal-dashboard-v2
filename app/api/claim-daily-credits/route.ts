import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentESTDate } from '@/lib/timezone-utils'

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_ATTEMPTS = 5 // Max 5 attempts per minute

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(userId)

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or create new limit
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (userLimit.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    return false
  }

  userLimit.count++
  return true
}

export async function POST() {
  const supabase = createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
  }

  // Check rate limit
  if (!checkRateLimit(user.id)) {
    console.warn('Rate limit exceeded for user:', user.id)
    return NextResponse.json({ 
      error: 'Too many attempts. Please wait a minute before trying again.' 
    }, { status: 429 })
  }

  try {
    // Get user credits with proper error handling
    const { data: userCredits, error: creditsError } = await supabase
      .from('user_credits')
      .select('last_daily_credit, current_credits, total_earned, daily_credit_amount')
      .eq('user_id', user.id)
      .single()

    if (creditsError) {
      console.error('Failed to retrieve user credits:', creditsError)
      return NextResponse.json({ error: 'Failed to retrieve user credits' }, { status: 500 })
    }

    // Get current EST date as YYYY-MM-DD string
    const todayEST = getCurrentESTDate()
    const lastClaimDate = userCredits?.last_daily_credit

    console.log('Credit claim attempt:', {
      userId: user.id,
      todayEST,
      lastClaimDate,
      canClaim: lastClaimDate !== todayEST
    })

    // Check if already claimed today
    if (lastClaimDate === todayEST) {
      return NextResponse.json({ 
        error: 'Daily credits already claimed',
        nextClaimDate: todayEST 
      }, { status: 429 })
    }

    // Use the daily_credit_amount from user record, fallback to 50
    const creditAmount = userCredits?.daily_credit_amount || 50
    const updatedCredits = (userCredits?.current_credits ?? 0) + creditAmount
    const updatedTotalEarned = (userCredits?.total_earned ?? 0) + creditAmount

    // Update user credits
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({
        current_credits: updatedCredits,
        total_earned: updatedTotalEarned,
        last_daily_credit: todayEST, // Store as EST date string
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Failed to update user credits:', updateError)
      return NextResponse.json({ error: 'Failed to update user credits' }, { status: 500 })
    }

    // Record the transaction
    const { error: transactionError } = await supabase.from('credit_transactions').insert([
      {
        user_id: user.id,
        type: 'daily_bonus',
        amount: creditAmount,
        description: `Daily free credits claimed (${todayEST})`,
      },
    ])

    if (transactionError) {
      // Log the error, but don't block the user since the credits were updated
      console.error('Failed to record credit transaction:', transactionError)
    }

    console.log('Credits claimed successfully:', {
      userId: user.id,
      amount: creditAmount,
      newBalance: updatedCredits,
      date: todayEST
    })

    return NextResponse.json({ 
      message: 'Daily credits claimed successfully', 
      newBalance: updatedCredits,
      creditsAwarded: creditAmount,
      claimDate: todayEST
    })

  } catch (error) {
    console.error('Unexpected error in claim-daily-credits:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
