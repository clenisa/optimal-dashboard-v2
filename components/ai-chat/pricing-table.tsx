"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import type { ProviderOption } from '@/lib/ai/chat/types'
import type { AIModel, AIProviderId } from '@/lib/ai/types'
import { cn } from '@/lib/utils'
import { SPACING_TOKENS, SURFACE_TOKENS, TYPOGRAPHY_TOKENS } from '@/lib/design-tokens'
import { ErrorBoundary } from '@/components/error-boundary'

interface AIChatPricingTableProps {
  providers: ProviderOption[]
  activeProvider?: AIProviderId
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 4,
})

function formatPrice(model: AIModel, type: 'prompt' | 'completion') {
  if (!model.pricing) return 'Included in credits'
  const amount = model.pricing[type]
  const unit = model.pricing.unit.replace('_', ' ')
  return `${currencyFormatter.format(amount)}/${unit}`
}

function getRecommendation(model: AIModel) {
  if (model.description) {
    return model.description
  }

  const name = model.name.toLowerCase()
  if (name.includes('mini') || name.includes('lite')) {
    return 'Fast responses for drafting and brainstorming'
  }
  if (name.includes('turbo') || name.includes('gpt-4')) {
    return 'High-quality reasoning and production use'
  }
  if (model.contextWindow && model.contextWindow >= 128000) {
    return 'Great for large documents and financial reports'
  }
  return 'Balanced performance for day-to-day assistance'
}

function PricingTableContent({ providers, activeProvider }: AIChatPricingTableProps) {
  const providerModels = providers.flatMap((provider) =>
    provider.models.map((model) => ({
      providerId: provider.id,
      providerName: provider.name,
      model,
      isDefault: provider.defaultModel === model.id || model.default === true,
    })),
  )

  if (providerModels.length === 0) {
    return (
      <Alert variant="default" className={cn('border', SURFACE_TOKENS.primary)}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No provider pricing information available yet.</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className={cn('border', SURFACE_TOKENS.primary)}>
      <CardHeader className="gap-1">
        <CardTitle className={cn(TYPOGRAPHY_TOKENS.heading, 'flex items-center gap-2 text-base sm:text-lg')}>
          Pricing & Recommendations
        </CardTitle>
        <p className={TYPOGRAPHY_TOKENS.caption}>
          Compare model costs, token pricing, and usage guidance across providers.
        </p>
      </CardHeader>
      <CardContent className={cn('overflow-hidden rounded-lg border', SURFACE_TOKENS.primary, SPACING_TOKENS.card)}>
        <div className="hidden text-sm font-medium text-muted-foreground md:grid md:grid-cols-[1.2fr_1fr_1fr_1.8fr] md:gap-3">
          <span>Model</span>
          <span>Prompt pricing</span>
          <span>Completion pricing</span>
          <span>Best for</span>
        </div>
        <div className="mt-2 space-y-3">
          {providerModels.map(({ providerId, providerName, model, isDefault }) => (
            <div
              key={`${providerId}-${model.id}`}
              className={cn(
                'flex flex-col gap-2 rounded-lg border p-3 text-sm md:grid md:grid-cols-[1.2fr_1fr_1fr_1.8fr]',
                SURFACE_TOKENS.primary,
                activeProvider === providerId ? 'border-primary/60 bg-hover-primary' : 'border-border/60',
              )}
            >
              <div>
                <p className="font-semibold text-foreground">
                  {model.name}
                  {isDefault && (
                    <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                      Default
                    </span>
                  )}
                </p>
                <p className={TYPOGRAPHY_TOKENS.caption}>
                  {providerName}
                  {model.contextWindow ? ` • ${model.contextWindow.toLocaleString()} token context` : ''}
                </p>
              </div>
              <div className="text-muted-foreground">{formatPrice(model, 'prompt')}</div>
              <div className="text-muted-foreground">{formatPrice(model, 'completion')}</div>
              <div className="text-foreground">{getRecommendation(model)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function PricingTableFallback({ retry }: { error?: Error; retry: () => void }) {
  return (
    <Alert variant="destructive" className={cn('border', SURFACE_TOKENS.primary)}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex flex-col gap-3">
        <span>Unable to render pricing information right now.</span>
        <Button variant="outline" size="sm" onClick={retry} className="self-start">
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  )
}

export function AIChatPricingTable(props: AIChatPricingTableProps) {
  return (
    <ErrorBoundary fallback={PricingTableFallback}>
      <PricingTableContent {...props} />
    </ErrorBoundary>
  )
}
