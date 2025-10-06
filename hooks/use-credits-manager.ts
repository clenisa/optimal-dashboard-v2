"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { logger } from '@/lib/logger'
import { cache, CACHE_KEYS } from '@/lib/cache-utils'
import { createClient } from '@/lib/supabase-client'
import {
  getCurrentESTDate,
  getTimeToNextESTMidnight,
  formatTimeRemaining,
} from '@/lib/timezone-utils'
import { CREDIT_PACKAGES, CREDIT_CACHE_TTL_MS, CREDIT_RETRY_MAX_ATTEMPTS } from '@/lib/credits/constants'
import type { CreditPackage, CreditTransaction, UserCredits } from '@/lib/credits/types'
import { useSupabaseUser } from '@/hooks/use-supabase-user'

interface UseCreditsManagerResult {
  user: ReturnType<typeof useSupabaseUser>
  credits: UserCredits | null
  transactions: CreditTransaction[]
  packages: CreditPackage[]
  loading: boolean
  isRetrying: boolean
  retryCount: number
  isClaiming: boolean
  canClaim: boolean
  timeToNextClaim: string
  error: string | null
  success: string | null
  purchaseCredits: (packageId: string) => Promise<void>
  claimDailyCredits: () => Promise<void>
  setError: (message: string | null) => void
  setSuccess: (message: string | null) => void
}

export function useCreditsManager(): UseCreditsManagerResult {
  const user = useSupabaseUser()
  const [credits, setCredits] = useState<UserCredits | null>(null)
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isClaiming, setIsClaiming] = useState(false)
  const [canClaim, setCanClaim] = useState(false)
  const [timeToNextClaim, setTimeToNextClaim] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearRetryTimeout = () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
  }

  const clearCountdownInterval = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
  }

  const clearSuccessTimeout = () => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current)
      successTimeoutRef.current = null
    }
  }

  useEffect(() => () => {
    clearRetryTimeout()
    clearCountdownInterval()
    clearSuccessTimeout()
  }, [])

  const loadCreditTransactions = useCallback(
    async (userId: string, useCache = true) => {
      const cacheKey = CACHE_KEYS.CREDIT_TRANSACTIONS(userId)

      if (useCache) {
        const cachedTransactions = cache.get<CreditTransaction[]>(cacheKey)
        if (cachedTransactions) {
          setTransactions(cachedTransactions)
          return
        }
      }

      try {
        const supabase = createClient()
        if (!supabase) return

        const { data, error: selectError } = await supabase
          .from('credit_transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50)

        if (!selectError && data) {
          setTransactions(data)
          cache.set(cacheKey, data, CREDIT_CACHE_TTL_MS)
        }
      } catch (selectError) {
        logger.error('CreditsManager', 'Error loading credit transactions', selectError)
      }
    },
    [],
  )

  const loadUserCreditsWithRetry = useCallback(
    async (userId: string, attempt = 1, useCache = true) => {
      const cacheKey = CACHE_KEYS.USER_CREDITS(userId)

      if (useCache) {
        const cachedCredits = cache.get<UserCredits>(cacheKey)
        if (cachedCredits) {
          setCredits(cachedCredits)
          return
        }
      }

      try {
        setRetryCount(attempt)
        setIsRetrying(attempt > 1)
        const supabase = createClient()
        if (!supabase) return

        const { data, error: selectError } = await supabase
          .from('user_credits')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (selectError && selectError.code !== 'PGRST116') {
          throw selectError
        }

        if (data) {
          setCredits(data)
          setError(null)
          setRetryCount(0)
          cache.set(cacheKey, data, CREDIT_CACHE_TTL_MS)
        } else {
          const { data: newCredits, error: insertError } = await supabase
            .from('user_credits')
            .insert({
              user_id: userId,
              total_credits: 10,
              total_earned: 10,
              daily_credit_amount: 50,
              last_daily_credit: getCurrentESTDate(),
            })
            .select()
            .single()

          if (insertError) {
            throw insertError
          }

          if (newCredits) {
            setCredits(newCredits)
            setError(null)
            setRetryCount(0)
            cache.set(cacheKey, newCredits, CREDIT_CACHE_TTL_MS)
          }
        }
      } catch (loadError) {
        logger.error('CreditsManager', `Error loading user credits (attempt ${attempt})`, loadError)

        if (attempt < CREDIT_RETRY_MAX_ATTEMPTS) {
          const delay = Math.pow(2, attempt - 1) * 1000
          retryTimeoutRef.current = setTimeout(() => {
            void loadUserCreditsWithRetry(userId, attempt + 1, false)
          }, delay)
        } else {
          setError(
            `Failed to load credits after ${CREDIT_RETRY_MAX_ATTEMPTS} attempts. Please refresh the page.`,
          )
        }
      } finally {
        setIsRetrying(false)
      }
    },
    [],
  )

  const loadUserCredits = useCallback(
    async (userId: string) => {
      clearRetryTimeout()
      await loadUserCreditsWithRetry(userId)
    },
    [loadUserCreditsWithRetry],
  )

  const refreshCountdown = useCallback(
    (currentCredits: UserCredits | null, currentUserId: string | null) => {
      clearCountdownInterval()

      if (!currentCredits || !currentUserId) {
        setCanClaim(false)
        setTimeToNextClaim('')
        return
      }

      const todayEST = getCurrentESTDate()
      const canClaimToday = currentCredits.last_daily_credit !== todayEST
      setCanClaim(canClaimToday)

      logger.debug('CreditsManager', 'Credit claim check', {
        todayEST,
        lastClaimDate: currentCredits.last_daily_credit,
        canClaim: canClaimToday,
      })

      const updateCountdown = () => {
        const timeRemaining = getTimeToNextESTMidnight()
        setTimeToNextClaim(formatTimeRemaining(timeRemaining))

        if (timeRemaining <= 0 && !canClaimToday) {
          void loadUserCredits(currentUserId)
        }
      }

      updateCountdown()
      countdownIntervalRef.current = setInterval(updateCountdown, 1000)
    },
    [loadUserCredits],
  )

  useEffect(() => {
    refreshCountdown(credits, user?.id ?? null)
  }, [credits, user?.id, refreshCountdown])

  const initializeForUser = useCallback(
    async (userId: string) => {
      await Promise.all([loadUserCredits(userId), loadCreditTransactions(userId)])
    },
    [loadCreditTransactions, loadUserCredits],
  )

  useEffect(() => {
    if (user?.id) {
      void initializeForUser(user.id)
    } else {
      setCredits(null)
      setTransactions([])
      setError(null)
      setSuccess(null)
      clearCountdownInterval()
      clearRetryTimeout()
    }
  }, [user, initializeForUser])

  const invalidateCaches = useCallback(
    (userId: string) => {
      cache.invalidate(CACHE_KEYS.USER_CREDITS(userId))
      cache.invalidate(CACHE_KEYS.CREDIT_TRANSACTIONS(userId))
    },
    [],
  )

  const purchaseCredits = useCallback(
    async (packageId: string) => {
      if (!user) return

      const selectedPackage = CREDIT_PACKAGES.find((pkg) => pkg.id === packageId)
      if (!selectedPackage) return

      setLoading(true)
      setError(null)
      setSuccess(null)

      try {
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            packageId: selectedPackage.id,
            userId: user.id,
            userEmail: user.email,
          }),
        })

        const { sessionId, error: sessionError } = await response.json()

        if (sessionError) {
          throw new Error(sessionError)
        }

        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
        if (stripe) {
          const { error: redirectError } = await stripe.redirectToCheckout({ sessionId })
          if (redirectError) {
            throw new Error(redirectError.message)
          }
        }
      } catch (purchaseError) {
        setError(purchaseError instanceof Error ? purchaseError.message : 'Failed to create checkout session')
      } finally {
        setLoading(false)
      }
    },
    [user],
  )

  const claimDailyCredits = useCallback(async () => {
    logger.debug('CreditsManager', 'Attempting to claim credits')
    setIsClaiming(true)
    setError(null)

    try {
      const response = await fetch('/api/claim-daily-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      logger.debug('CreditsManager', 'Claim response', { status: response.status, data })

      if (response.ok) {
        setCanClaim(false)
        if (user?.id) {
          invalidateCaches(user.id)
          await loadUserCredits(user.id)
          await loadCreditTransactions(user.id, false)
        }
        setSuccess(`Daily credits claimed! +${data.creditsAwarded || 50} credits added.`)
        clearSuccessTimeout()
        successTimeoutRef.current = setTimeout(() => setSuccess(null), 5000)
      } else if (response.status === 429) {
        setError('You have already claimed your daily credits. Try again tomorrow!')
      } else if (response.status === 401) {
        setError('Please log in to claim daily credits.')
      } else {
        setError(data.error || 'Failed to claim daily credits. Please try again.')
      }
    } catch (claimError) {
      setError('Network error. Please check your connection and try again.')
      logger.error('CreditsManager', 'Claim daily credits failed', claimError)
    } finally {
      setIsClaiming(false)
    }
  }, [invalidateCaches, loadCreditTransactions, loadUserCredits, user?.id])

  const packages = useMemo(() => CREDIT_PACKAGES, [])

  return {
    user,
    credits,
    transactions,
    packages,
    loading,
    isRetrying,
    retryCount,
    isClaiming,
    canClaim,
    timeToNextClaim,
    error,
    success,
    purchaseCredits,
    claimDailyCredits,
    setError,
    setSuccess,
  }
}
