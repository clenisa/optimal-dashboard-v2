"use client"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
              className={`relative rounded-lg border-2 p-4 ${
                pkg.popular ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
              }`}
            >
              {pkg.popular && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">Most Popular</Badge>
              )}
              <div className="text-center">
                <h3 className="text-lg font-semibold">{pkg.name}</h3>
                <div className="my-2 text-2xl font-bold text-blue-600">${pkg.price}</div>
                <div className="mb-4 text-sm text-gray-600">
                  {pkg.credits} credits
                  {pkg.bonus && (
                    <div className="font-medium text-green-600">+{pkg.bonus} bonus credits!</div>
                  )}
                </div>
                <Button
                  onClick={() => void onPurchase(pkg.id)}
                  disabled={isProcessing}
                  className="w-full"
                  variant={pkg.popular ? 'default' : 'outline'}
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
