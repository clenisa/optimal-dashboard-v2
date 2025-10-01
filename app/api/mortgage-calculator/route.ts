import { NextRequest, NextResponse } from 'next/server'

const MORTGAGE_CALCULATOR_SERVICE_URL =
  process.env.MORTGAGE_CALCULATOR_SERVICE_URL || 'http://mortgage-calculator:3004'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${MORTGAGE_CALCULATOR_SERVICE_URL}/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Service responded with ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Mortgage calculator proxy error:', {
      error: error instanceof Error ? error.message : error,
      serviceUrl: MORTGAGE_CALCULATOR_SERVICE_URL,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json(
      {
        error: 'Failed to calculate mortgage',
        details:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : 'Unknown error'
            : undefined,
      },
      { status: 500 },
    )
  }
}
