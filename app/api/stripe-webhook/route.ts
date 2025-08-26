import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!stripeSecret || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables for Stripe/Supabase webhook route', {
      hasStripeSecret: !!stripeSecret,
      hasWebhookSecret: !!webhookSecret,
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseServiceKey: !!supabaseServiceKey,
    })
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: '2024-06-20' })
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.payment_status === 'paid') {
          const { userId, packageId, credits } = session.metadata!
          const creditsToAdd = parseInt(credits)

          const { data: currentCredits, error: fetchError } = await supabase
            .from('user_credits')
            .select('current_credits, total_earned')
            .eq('user_id', userId)
            .single()

          if (fetchError) {
            console.error('Error fetching user credits:', fetchError)
            return NextResponse.json(
              { error: 'Failed to fetch user credits' },
              { status: 500 }
            )
          }

          const { error: updateError } = await supabase
            .from('user_credits')
            .update({
              current_credits: currentCredits.current_credits + creditsToAdd,
              total_earned: currentCredits.total_earned + creditsToAdd
            })
            .eq('user_id', userId)

          if (updateError) {
            console.error('Error updating user credits:', updateError)
            return NextResponse.json(
              { error: 'Failed to update credits' },
              { status: 500 }
            )
          }

          const { error: logError } = await supabase
            .from('credit_transactions')
            .insert({
              user_id: userId,
              type: 'purchased',
              amount: creditsToAdd,
              description: `Purchased ${packageId} package`,
              stripe_payment_intent_id: session.payment_intent as string
            })

          if (logError) {
            console.error('Error logging credit transaction:', logError)
          }

          console.log(`Successfully added ${creditsToAdd} credits to user ${userId}`)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment failed:', paymentIntent.id)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

