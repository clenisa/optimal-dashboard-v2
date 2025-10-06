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
      <div className="space-y-6">
        <CreditsOverviewCard
          credits={credits}
          canClaim={canClaim}
          isClaiming={isClaiming}
          timeToNextClaim={timeToNextClaim}
          isRetrying={isRetrying}
          retryCount={retryCount}
          onClaim={claimDailyCredits}
        />

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
