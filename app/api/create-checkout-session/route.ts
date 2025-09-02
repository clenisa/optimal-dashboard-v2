import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { logger } from '@/lib/logger'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

type CreditPackage = { name: string; credits: number; price: number; bonus?: number }
const creditPackages: Record<string, CreditPackage> = {
  starter: { name: 'Starter Pack', credits: 50, price: 4.99 },
  popular: { name: 'Popular Pack', credits: 150, price: 12.99, bonus: 25 },
  power: { name: 'Power User', credits: 300, price: 24.99, bonus: 75 },
  unlimited: { name: 'Monthly Unlimited', credits: 1000, price: 49.99, bonus: 200 }
}

export async function POST(request: NextRequest) {
  try {
    const { packageId, userId, userEmail } = await request.json()

    if (!packageId || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const selectedPackage = creditPackages[packageId as keyof typeof creditPackages]
    if (!selectedPackage) {
      return NextResponse.json(
        { error: 'Invalid package ID' },
        { status: 400 }
      )
    }

    const totalCredits = selectedPackage.credits + (selectedPackage.bonus ?? 0)

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: selectedPackage.name,
              description: `${totalCredits} AI credits for Optimal Desktop`,
              images: ['https://your-domain.com/credits-icon.png'] // Optional
            },
            unit_amount: Math.round(selectedPackage.price * 100) // Convert to cents
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/credits/cancelled`,
      customer_email: userEmail,
      metadata: {
        userId,
        packageId,
        credits: totalCredits.toString()
      }
    })

    return NextResponse.json({ sessionId: session.id })

  } catch (error) {
    logger.error('CreateCheckoutSession', 'Error creating checkout session', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

