import { NextResponse } from 'next/server'
import { getProviderRegistry } from '@/lib/ai/provider-registry'

export async function GET() {
  const registry = getProviderRegistry()
  const providers = registry.listProviders()

  const enriched = await Promise.all(
    providers.map(async (provider) => {
      const instance = registry.getProvider(provider.id as any)
      const models = instance ? await instance.getModels() : []
      return { ...provider, models }
    })
  )

  return NextResponse.json({ providers: enriched })
}
