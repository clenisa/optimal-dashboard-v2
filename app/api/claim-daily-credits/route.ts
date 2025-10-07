import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { claimDailyCredits } from '@/lib/ai/chat/credit-service'

export async function POST() {
  const supabase = createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
  }

  try {
    const result = await claimDailyCredits(user.id, supabase)

    if (!result) {
      return NextResponse.json({ error: 'Failed to update user credits' }, { status: 500 })
    }

    const { awarded, credits, amount, claimDate, previousLastClaimDate } = result

    console.log('Credit claim attempt:', {
      userId: user.id,
      claimDate,
      lastClaimDate: previousLastClaimDate,
      awarded,
    })

    if (!awarded) {
      return NextResponse.json({ 
        error: 'Daily credits already claimed',
        nextClaimDate: claimDate 
      }, { status: 429 })
    }

    console.log('Credits claimed successfully:', {
      userId: user.id,
      amount,
      newBalance: credits?.total_credits ?? 0,
      date: claimDate
    })

    return NextResponse.json({ 
      message: 'Daily credits claimed successfully', 
      newBalance: credits?.total_credits ?? 0,
      creditsAwarded: amount,
      claimDate,
    })

  } catch (error) {
    console.error('Unexpected error in claim-daily-credits:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
