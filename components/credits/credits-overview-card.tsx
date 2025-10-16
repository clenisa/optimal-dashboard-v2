"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { UserCredits } from '@/lib/credits/types'
import { CreditCard, Gift, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SPACING_TOKENS } from '@/lib/design-tokens'

interface CreditsOverviewCardProps {
  credits: UserCredits | null
  canClaim: boolean
  isClaiming: boolean
  timeToNextClaim: string
  isRetrying: boolean
  retryCount: number
  onClaim: () => Promise<void>
}

export function CreditsOverviewCard({
  credits,
  canClaim,
  isClaiming,
  timeToNextClaim,
  isRetrying,
  retryCount,
  onClaim,
}: CreditsOverviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Your Credits
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isRetrying ? (
          <div className={cn('flex items-center justify-center gap-2', SPACING_TOKENS.container)}>
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Retrying{retryCount > 1 ? ` (attempt ${retryCount})` : '...'}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Statistic
              label="Available Credits"
              value={credits?.total_credits ?? 0}
              accent="text-blue-600"
              valueClassName="text-3xl"
            />
            <Statistic label="Total Earned" value={credits?.total_earned ?? 0} accent="text-green-600" />
            <Statistic label="Total Spent" value={credits?.total_spent ?? 0} accent="text-orange-600" />
            <ClaimAction
              canClaim={canClaim}
              isClaiming={isClaiming}
              timeToNextClaim={timeToNextClaim}
              onClaim={onClaim}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function Statistic({
  label,
  value,
  accent,
  valueClassName = 'text-2xl',
}: {
  label: string
  value: number
  accent: string
  valueClassName?: string
}) {
  return (
    <div className="text-center">
      <div className={`${valueClassName} font-bold ${accent}`}>{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}

function ClaimAction({
  canClaim,
  isClaiming,
  timeToNextClaim,
  onClaim,
}: {
  canClaim: boolean
  isClaiming: boolean
  timeToNextClaim: string
  onClaim: () => Promise<void>
}) {
  return (
    <div className="text-center">
      <Button
        onClick={() => void onClaim()}
        disabled={!canClaim || isClaiming}
        variant={canClaim ? 'default' : 'secondary'}
        className="w-full"
      >
        {isClaiming
          ? 'Claiming...'
          : canClaim
          ? (
              <span className="flex items-center justify-center gap-2">
                <Gift className="w-4 h-4" />
                Claim 50 Free Credits
              </span>
            )
          : `Next claim in ${timeToNextClaim}`}
      </Button>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        {canClaim
          ? 'You can claim your daily free credits now!'
          : `Daily credits refresh at midnight EST. Next claim in ${timeToNextClaim}`}
      </p>
    </div>
  )
}
