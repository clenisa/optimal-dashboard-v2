import { NextResponse } from 'next/server'

const MORTGAGE_CALCULATOR_SERVICE_URL =
  process.env.MORTGAGE_CALCULATOR_SERVICE_URL || 'http://mortgage-calculator:3004'

export async function GET() {
  try {
    const response = await fetch(`${MORTGAGE_CALCULATOR_SERVICE_URL}/health`)

    if (!response.ok) {
      throw new Error(`Service responded with ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      proxy: 'ok',
      service: data,
      serviceUrl: MORTGAGE_CALCULATOR_SERVICE_URL,
    })
  } catch (error) {
    return NextResponse.json(
      {
        proxy: 'ok',
        service: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        serviceUrl: MORTGAGE_CALCULATOR_SERVICE_URL,
      },
      { status: 500 },
    )
  }
}
