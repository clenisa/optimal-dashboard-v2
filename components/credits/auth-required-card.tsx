"use client"

import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export function CreditsAuthRequiredCard() {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <p className="mb-2 text-lg font-medium">Authentication Required</p>
        <p className="text-sm text-gray-600">Please log in to manage your credits.</p>
      </CardContent>
    </Card>
  )
}
