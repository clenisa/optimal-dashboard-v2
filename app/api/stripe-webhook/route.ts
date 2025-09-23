import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headersList = headers()
  const sig = headersList.get('stripe-signature')

  if (!sig) {
    console.error('Missing Stripe signature')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log('Received Stripe webhook:', event.type)

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
        break
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = createClient()
  
  if (!session.metadata?.userId || !session.metadata?.packageId) {
    console.error('Missing metadata in checkout session:', session.id)
    return
  }

  const userId = session.metadata.userId
  const packageId = session.metadata.packageId
  
  // Define credit packages (should match frontend)
  const creditPackages = {
    starter: { credits: 50, bonus: 0 },
    popular: { credits: 150, bonus: 25 },
    power: { credits: 300, bonus: 75 },
    unlimited: { credits: 1000, bonus: 200 }
  }

  const packageInfo = creditPackages[packageId as keyof typeof creditPackages]
  if (!packageInfo) {
    console.error('Invalid package ID:', packageId)
    return
  }

  const totalCredits = packageInfo.credits + packageInfo.bonus

  try {
    // Update user credits
    const { data: currentCredits } = await supabase
      .from('user_credits')
      .select('current_credits, total_earned')
      .eq('user_id', userId)
      .single()

    const newCredits = (currentCredits?.current_credits || 0) + totalCredits
    const newTotalEarned = (currentCredits?.total_earned || 0) + totalCredits

    await supabase
      .from('user_credits')
      .update({
        current_credits: newCredits,
        total_earned: newTotalEarned
      })
      .eq('user_id', userId)

    // Record transaction
    await supabase.from('credit_transactions').insert({
      user_id: userId,
      type: 'purchased',
      amount: totalCredits,
      description: `Purchased ${packageInfo.credits} credits${packageInfo.bonus > 0 ? ` (+${packageInfo.bonus} bonus)` : ''}`,
      stripe_payment_intent_id: session.payment_intent as string,
      metadata: {
        package_id: packageId,
        session_id: session.id,
        amount_paid: session.amount_total
      }
    })

    console.log('Credits added successfully:', {
      userId,
      packageId,
      creditsAdded: totalCredits,
      newBalance: newCredits
    })

  } catch (error) {
    console.error('Error updating credits:', error)
    throw error
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id)
  // Additional logic if needed
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id)
  // Handle failed payments - maybe notify user or log for review
}
