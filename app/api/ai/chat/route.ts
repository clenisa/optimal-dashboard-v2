import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { getProviderRegistry } from '@/lib/ai/provider-registry'
import type { ChatCompletionRequest } from '@/lib/ai/types'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatCompletionRequest
    const registry = getProviderRegistry()
    const provider = registry.getProvider(body.provider)

    if (!provider) {
      return NextResponse.json({ error: `Provider ${body.provider} not configured` }, { status: 400 })
    }

    const result = await provider.sendMessage({ request: body })

    return NextResponse.json(result)
  } catch (error) {
    logger.error('AIChatRoute', 'Failed to process AI chat request', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
