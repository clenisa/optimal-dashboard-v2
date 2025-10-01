import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentESTDate } from '@/lib/timezone-utils'

export async function POST() {
  const supabase = createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
  }

  try {
    // Get user credits - using correct column names
    const { data: userCredits, error: creditsError } = await supabase
      .from('user_credits')
      .select('last_daily_credit, total_credits, total_earned, daily_credit_amount')
      .eq('user_id', user.id)
      .single()

    if (creditsError) {
      console.error('Failed to retrieve user credits:', creditsError)
      return NextResponse.json({ error: 'Failed to retrieve user credits' }, { status: 500 })
    }

    const todayEST = getCurrentESTDate()
    const lastClaimDate = userCredits?.last_daily_credit

    console.log('Credit claim attempt:', {
      userId: user.id,
      todayEST,
      lastClaimDate,
      canClaim: lastClaimDate !== todayEST
    })

    if (lastClaimDate === todayEST) {
      return NextResponse.json({ 
        error: 'Daily credits already claimed',
        nextClaimDate: todayEST 
      }, { status: 429 })
    }

    const creditAmount = userCredits?.daily_credit_amount || 50
    const updatedCredits = (userCredits?.total_credits ?? 0) + creditAmount
    const updatedTotalEarned = (userCredits?.total_earned ?? 0) + creditAmount

    // Update using correct column names
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({
        total_credits: updatedCredits,
        total_earned: updatedTotalEarned,
        last_daily_credit: todayEST,
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Failed to update user credits:', updateError)
      return NextResponse.json({ error: 'Failed to update user credits' }, { status: 500 })
    }

    // Record transaction
    const { error: transactionError } = await supabase.from('credit_transactions').insert([
      {
        user_id: user.id,
        type: 'daily_bonus',
        amount: creditAmount,
        description: `Daily free credits claimed (${todayEST})`,
      },
    ])

    if (transactionError) {
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
