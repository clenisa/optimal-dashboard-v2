'use client'

import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import type { AIProviderId } from '@/lib/ai/types'

interface ProviderDescriptor {
  id: AIProviderId
  name: string
  defaultModel?: string
}

interface ProviderSelectorProps {
  providers: ProviderDescriptor[]
  value: AIProviderId
  onChange: (provider: AIProviderId) => void
  status?: Record<string, { ok: boolean; latency?: number; error?: string }>
}

export function AIProviderSelector({ providers, value, onChange, status }: ProviderSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={(val) => onChange(val as AIProviderId)}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select AI provider" />
        </SelectTrigger>
        <SelectContent>
          {providers.map((provider) => (
            <SelectItem key={provider.id} value={provider.id}>
              <div className="flex items-center justify-between w-full">
                <span>{provider.name}</span>
                <Badge
                  variant={status?.[provider.id]?.ok ? 'default' : 'destructive'}
                  className="ml-2 text-xs font-normal"
                >
                  {status?.[provider.id]?.ok
                    ? `Online${status?.[provider.id]?.latency ? ` • ${status?.[provider.id]?.latency}ms` : ''}`
                    : status?.[provider.id]?.error || 'Offline'}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
