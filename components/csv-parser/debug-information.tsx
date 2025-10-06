"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

interface DebugInformationProps {
  debugInfo: string[]
}

export function DebugInformation({ debugInfo }: DebugInformationProps) {
  if (debugInfo.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Debug Information</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-32 w-full">
          <div className="space-y-1">
            {debugInfo.map((info, index) => (
              <div key={`${info}-${index}`} className="text-xs font-mono text-gray-600">
                {info}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
