"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, DollarSign, Gift, History, AlertCircle, CheckCircle } from 'lucide-react'
import { createClient } from "@/lib/supabase-client"
import { User } from "@supabase/supabase-js"
import { loadStripe } from '@stripe/stripe-js'

interface UserCredits {
  current_credits: number
  total_earned: number
  total_spent: number
  last_daily_credit: string
}

interface CreditTransaction {
  id: string
  type: 'earned' | 'spent' | 'purchased' | 'daily_bonus'
  amount: number
  description: string
  created_at: string
  stripe_payment_intent_id?: string
}

interface CreditPackage {
  id: string
  name: string
  credits: number
  price: number
  popular?: boolean
  bonus?: number
}

const creditPackages: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 50,
    price: 4.99
  },
  {
    id: 'popular',
    name: 'Popular Pack',
    credits: 150,
    price: 12.99,
    popular: true,
    bonus: 25
  },
  {
    id: 'power',
    name: 'Power User',
    credits: 300,
    price: 24.99,
    bonus: 75
  },
  {
    id: 'unlimited',
    name: 'Monthly Unlimited',
    credits: 1000,
    price: 49.99,
    bonus: 200
  }
]

export function CreditsManager() {
  const [user, setUser] = useState<User | null>(null)
  const [credits, setCredits] = useState<UserCredits | null>(null)
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    if (supabase) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user)
        if (user) {
          loadUserCredits(user.id)
          loadCreditTransactions(user.id)
        }
      })

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        const newUser = session?.user ?? null
        setUser(newUser)
        if (newUser) {
          loadUserCredits(newUser.id)
          loadCreditTransactions(newUser.id)
        }
      })

      return () => subscription.unsubscribe()
    }
  }, [])

  const loadUserCredits = async (userId: string) => {
    try {
      const supabase = createClient()
      if (!supabase) return

      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading credits:', error)
        return
      }

      if (data) {
        setCredits(data)
      } else {
        // Create initial credits for new user
        const { data: newCredits, error: insertError } = await supabase
          .from('user_credits')
          .insert({
            user_id: userId,
            current_credits: 10,
            total_earned: 10,
            last_daily_credit: new Date().toISOString().split('T')[0]
          })
          .select()
          .single()

        if (!insertError && newCredits) {
          setCredits(newCredits)
        }
      }
    } catch (err) {
      console.error('Error loading user credits:', err)
    }
  }

  const loadCreditTransactions = async (userId: string) => {
    try {
      const supabase = createClient()
      if (!supabase) return

      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (!error && data) {
        setTransactions(data)
      }
    } catch (err) {
      console.error('Error loading credit transactions:', err)
    }
  }

  const purchaseCredits = async (packageId: string) => {
    if (!user) return

    const selectedPackage = creditPackages.find(p => p.id === packageId)
    if (!selectedPackage) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Create Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          userId: user.id,
          userEmail: user.email
        })
      })

      const { sessionId, error: sessionError } = await response.json()

      if (sessionError) {
        throw new Error(sessionError)
      }

      // Redirect to Stripe Checkout
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId })
        if (error) {
          throw new Error(error.message)
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create checkout session')
    } finally {
      setLoading(false)
    }
  }

  const claimDailyCredits = async () => {
    if (!user || !credits) return

    const today = new Date().toISOString().split('T')[0]
    if (credits.last_daily_credit === today) {
      setError('Daily credits already claimed today')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      if (!supabase) return

      const { data, error } = await supabase
        .from('user_credits')
        .update({
          current_credits: credits.current_credits + 5,
          total_earned: credits.total_earned + 5,
          last_daily_credit: today
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (!error && data) {
        setCredits(data)
        setSuccess('Daily credits claimed! +5 credits added.')
        
        // Log the transaction
        await supabase
          .from('credit_transactions')
          .insert({
            user_id: user.id,
            type: 'daily_bonus',
            amount: 5,
            description: 'Daily login bonus'
          })

        // Reload transactions
        loadCreditTransactions(user.id)
      }
    } catch (err) {
      setError('Failed to claim daily credits')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned':
      case 'daily_bonus':
        return <Gift className="w-4 h-4 text-green-600" />
      case 'purchased':
        return <CreditCard className="w-4 h-4 text-blue-600" />
      case 'spent':
        return <DollarSign className="w-4 h-4 text-orange-600" />
      default:
        return <History className="w-4 h-4 text-gray-600" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earned':
      case 'daily_bonus':
      case 'purchased':
        return 'text-green-600'
      case 'spent':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">Authentication Required</p>
          <p className="text-sm text-gray-600">Please log in to manage your credits.</p>
        </CardContent>
      </Card>
    )
  }

  const today = new Date().toISOString().split('T')[0]
  const canClaimDaily = credits && credits.last_daily_credit !== today

  return (
    <div className="space-y-6">
      {/* Credits Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Your Credits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {credits?.current_credits || 0}
              </div>
              <div className="text-sm text-gray-600">Available Credits</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {credits?.total_earned || 0}
              </div>
              <div className="text-sm text-gray-600">Total Earned</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {credits?.total_spent || 0}
              </div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </div>
            
            <div className="text-center">
              <Button 
                onClick={claimDailyCredits}
                disabled={!canClaimDaily || loading}
                variant={canClaimDaily ? "default" : "secondary"}
                className="w-full"
              >
                {canClaimDaily ? (
                  <>
                    <Gift className="w-4 h-4 mr-2" />
                    Claim Daily +5
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Claimed Today
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error/Success Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="purchase" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="purchase">Purchase Credits</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="purchase" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Credit Packages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {creditPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`relative p-4 rounded-lg border-2 ${
                      pkg.popular 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    {pkg.popular && (
                      <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        Most Popular
                      </Badge>
                    )}
                    
                    <div className="text-center">
                      <h3 className="font-semibold text-lg">{pkg.name}</h3>
                      <div className="text-2xl font-bold text-blue-600 my-2">
                        ${pkg.price}
                      </div>
                      <div className="text-sm text-gray-600 mb-4">
                        {pkg.credits} credits
                        {pkg.bonus && (
                          <div className="text-green-600 font-medium">
                            +{pkg.bonus} bonus credits!
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => purchaseCredits(pkg.id)}
                        disabled={loading}
                        className="w-full"
                        variant={pkg.popular ? "default" : "outline"}
                      >
                        {loading ? 'Processing...' : 'Purchase'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-sm text-gray-500">
                            {formatDate(transaction.created_at)}
                          </div>
                        </div>
                      </div>
                      <div className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

