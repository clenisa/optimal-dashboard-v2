import { NextRequest, NextResponse } from 'next/server'
import { getProviderRegistry } from '@/lib/ai/provider-registry'

export async function GET(request: NextRequest) {
  const providerId = request.nextUrl.searchParams.get('provider')
  const registry = getProviderRegistry()

  if (providerId) {
    const provider = registry.getProvider(providerId as any)
    if (!provider) {
      return NextResponse.json({ error: `Provider ${providerId} not configured` }, { status: 404 })
    }

    const status = await provider.checkStatus()
    return NextResponse.json({ provider: providerId, status })
  }

  const statuses = await Promise.all(
    registry.listProviders().map(async (provider) => {
      const instance = registry.getProvider(provider.id as any)
      const status = instance ? await instance.checkStatus() : { ok: false, error: 'Not configured' }
      return { provider: provider.id, status }
    })
  )

  return NextResponse.json({ statuses })
}
