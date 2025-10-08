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
  } = useCreditsManager()

  if (!user) {
    return <CreditsAuthRequiredCard />
  }

  const remainingCredits = credits?.total_credits ?? 0
  const lifetimeCredits = credits?.total_earned ?? 0
  const dailyAmount = credits?.daily_credit_amount ?? 50

  return (
    <ErrorBoundary fallback={CreditsErrorFallback}>
      <div className="space-y-6 lg:space-y-8">
        <div className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Available Credits
              </p>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold tracking-tight text-foreground">
                  {remainingCredits.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground">
                  Lifetime earned: {lifetimeCredits.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {canClaim
                  ? `You can claim ${dailyAmount} daily credits right now.`
                  : timeToNextClaim
                  ? `Next daily credits available in ${timeToNextClaim}.`
                  : 'Daily credits refresh automatically at midnight (EST).'}
              </p>
              {isRetrying && (
                <p className="text-xs text-amber-500">
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
              <p className="text-xs text-muted-foreground">
                Need more power? Choose a package to top up instantly.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="border-destructive/50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-primary/40 bg-primary/10 text-primary">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="purchase" className="w-full">
          <TabsList className="grid w-full grid-cols-2 gap-2 rounded-lg bg-muted/60 p-1">
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
