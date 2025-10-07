"use client"

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreditsAuthRequiredCard } from '@/components/credits/auth-required-card'
import { CreditPackagesCard } from '@/components/credits/credit-packages-card'
import { CreditsOverviewCard } from '@/components/credits/credits-overview-card'
import { CreditTransactionsCard } from '@/components/credits/credit-transactions-card'
import { ErrorBoundary, CreditsErrorFallback } from '@/components/error-boundary'
import { useCreditsManager } from '@/hooks/use-credits-manager'
import { AlertCircle, CheckCircle } from 'lucide-react'

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

  return (
    <ErrorBoundary fallback={CreditsErrorFallback}>
      <div className="space-y-6 lg:space-y-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
          <CreditsOverviewCard
            credits={credits}
            canClaim={canClaim}
            isClaiming={isClaiming}
            timeToNextClaim={timeToNextClaim}
            isRetrying={isRetrying}
            retryCount={retryCount}
            onClaim={claimDailyCredits}
          />

          <div className="space-y-4 lg:space-y-6">
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
        </div>
      </div>
    </ErrorBoundary>
  )
}
