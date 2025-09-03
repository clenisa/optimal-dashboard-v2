import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST() {
  const supabase = createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
  }

  const { data: userCredits, error: creditsError } = await supabase
    .from('user_credits')
    .select('last_daily_credit, current_credits, total_earned')
    .eq('user_id', user.id)
    .single()

  if (creditsError) {
    return NextResponse.json({ error: 'Failed to retrieve user credits' }, { status: 500 })
  }

  const today = new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York' })
  const lastClaimDate = userCredits?.last_daily_credit
    ? new Date(userCredits.last_daily_credit).toLocaleDateString('en-US', { timeZone: 'America/New_York' })
    : null

  if (lastClaimDate === today) {
    return NextResponse.json({ error: 'Daily credits already claimed' }, { status: 429 })
  }

  const newCreditAmount = 50
  const updatedCredits = (userCredits?.current_credits ?? 0) + newCreditAmount
  const updatedTotalEarned = (userCredits?.total_earned ?? 0) + newCreditAmount

  const { error: updateError } = await supabase
    .from('user_credits')
    .update({
      current_credits: updatedCredits,
      total_earned: updatedTotalEarned,
      last_daily_credit: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update user credits' }, { status: 500 })
  }

  const { error: transactionError } = await supabase.from('credit_transactions').insert([
    {
      user_id: user.id,
      type: 'daily_bonus',
      amount: newCreditAmount,
      description: 'Daily free credits claimed',
    },
  ])

  if (transactionError) {
    // Log the error, but don't block the user since the credits were updated
    console.error('Failed to record credit transaction:', transactionError)
  }

  return NextResponse.json({ message: 'Daily credits claimed successfully', newBalance: updatedCredits })
}

