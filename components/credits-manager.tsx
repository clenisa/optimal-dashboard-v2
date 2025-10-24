"use client"

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreditsAuthRequiredCard } from '@/components/credits/auth-required-card'
import { CreditPackagesCard } from '@/components/credits/credit-packages-card'
import { CreditTransactionsCard } from '@/components/credits/credit-transactions-card'
import { ErrorBoundary, CreditsErrorFallback } from '@/components/error-boundary'
import { useCreditsManager } from '@/hooks/use-credits-manager'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { SPACING_TOKENS, SURFACE_TOKENS, TYPOGRAPHY_TOKENS } from '@/lib/design-tokens'

export function CreditsManager() {
  const {
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
    reload,
  } = useCreditsManager()

  if (!user) {
    return <CreditsAuthRequiredCard />
  }

  const isCreditsLoading = loading && !credits
  const remainingCredits = credits?.total_credits ?? 0
  const lifetimeCredits = credits?.total_earned ?? 0
  const dailyAmount = credits?.daily_credit_amount ?? 50

  return (
    <ErrorBoundary fallback={CreditsErrorFallback}>
      <div className={cn(SPACING_TOKENS.section, 'lg:space-y-6')}>
        <div className={cn('rounded-xl border', SURFACE_TOKENS.elevated, 'sm:p-6', SPACING_TOKENS.card)}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className={cn(TYPOGRAPHY_TOKENS.caption, 'font-semibold uppercase tracking-wide')}>
                Available Credits
              </p>
              <div className="flex items-baseline gap-3">
                {isCreditsLoading ? (
                  <LoadingSkeleton lines={1} widths={['6rem']} lineClassName="h-8" />
                ) : (
                  <span className="text-3xl font-bold tracking-tight text-foreground">
                    {remainingCredits.toLocaleString()}
                  </span>
                )}
                {isCreditsLoading ? (
                  <LoadingSkeleton lines={1} widths={['7rem']} lineClassName="h-3" />
                ) : (
                  <span className={TYPOGRAPHY_TOKENS.caption}>
                    Lifetime earned: {lifetimeCredits.toLocaleString()}
                  </span>
                )}
              </div>
              <p className={TYPOGRAPHY_TOKENS.body}>
                {isCreditsLoading
                  ? 'Checking your credit balance...'
                  : canClaim
                  ? `You can claim ${dailyAmount} daily credits right now.`
                  : timeToNextClaim
                  ? `Next daily credits available in ${timeToNextClaim}.`
                  : 'Daily credits refresh automatically at midnight (EST).'}
              </p>
              {isRetrying && (
                <p className={cn(TYPOGRAPHY_TOKENS.caption, 'text-amber-500')}>
                  Syncing with billing... (attempt {retryCount})
                </p>
              )}
            </div>

            <div className="flex flex-col items-stretch gap-2 md:items-end">
              <Button
                size="lg"
                onClick={() => void claimDailyCredits()}
                disabled={!canClaim || isClaiming}
                className="font-semibold"
              >
                {canClaim ? (isClaiming ? 'Claiming credits...' : `Claim +${dailyAmount}`) : 'Daily claim unavailable'}
              </Button>
              <p className={TYPOGRAPHY_TOKENS.caption}>
                Need more power? Choose a package to top up instantly.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <Alert
            variant="destructive"
            aria-live="assertive"
            className={cn('border text-destructive', SURFACE_TOKENS.primary, 'border-destructive/40')}
          >
            <AlertCircle className="h-4 w-4" />
            <div className="flex flex-1 flex-col gap-2">
              <AlertDescription>{error}</AlertDescription>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void reload()}
                  className="w-fit"
                >
                  Retry sync
                </Button>
              </div>
            </div>
          </Alert>
        )}

        {success && (
          <Alert aria-live="polite" className={cn('border text-primary', SURFACE_TOKENS.primary, 'border-primary/40')}>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="purchase" className="w-full">
          <TabsList className={cn('grid w-full grid-cols-2 gap-2 rounded-lg p-1', SURFACE_TOKENS.secondary)}>
            <TabsTrigger value="purchase" className="text-sm font-medium">
              Purchase Credits
            </TabsTrigger>
            <TabsTrigger value="history" className="text-sm font-medium">
              Transaction History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="purchase" className="space-y-4">
            <CreditPackagesCard
              packages={packages}
              isProcessing={loading}
              onPurchase={purchaseCredits}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <CreditTransactionsCard transactions={transactions} />
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  )
}
