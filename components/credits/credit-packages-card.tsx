"use client"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { CreditPackage } from '@/lib/credits/types'

interface CreditPackagesCardProps {
  packages: CreditPackage[]
  isProcessing: boolean
  onPurchase: (packageId: string) => Promise<void>
}

export function CreditPackagesCard({ packages, isProcessing, onPurchase }: CreditPackagesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Credit Packages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={cn(
                'relative rounded-xl border p-4 transition-all duration-200 shadow-sm',
                pkg.popular
                  ? 'border-primary/70 bg-primary/5 dark:bg-primary/15 ring-1 ring-primary/20'
                  : 'border-border bg-card hover:border-primary/40'
              )}
            >
              {pkg.popular && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2" variant="default">
                  Most Popular
                </Badge>
              )}
              <div className="flex h-full flex-col items-center text-center">
                <h3 className="text-lg font-semibold">{pkg.name}</h3>
                <div className="my-2 text-2xl font-bold text-primary">${pkg.price}</div>
                <div className="mb-4 text-sm text-muted-foreground">
                  {pkg.credits} credits
                  {pkg.bonus && (
                    <div className="font-medium text-emerald-600 dark:text-emerald-400">
                      +{pkg.bonus} bonus credits!
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => void onPurchase(pkg.id)}
                  disabled={isProcessing}
                  className="w-full"
                  variant={pkg.popular ? 'default' : 'secondary'}
                >
                  {isProcessing ? 'Processing...' : 'Purchase'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
