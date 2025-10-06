import type { ProviderOption } from './types'

export const DEFAULT_PROVIDER = (
  process.env.NEXT_PUBLIC_DEFAULT_AI_PROVIDER as ProviderOption['id'] | undefined
) ?? 'ollama'

export function resolveInitialModel(provider: ProviderOption): string | undefined {
  return provider.defaultModel || provider.models?.[0]?.id
}
