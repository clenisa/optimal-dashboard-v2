import { NextRequest, NextResponse } from 'next/server';

const serviceUrl = process.env.MORTGAGE_CALCULATOR_SERVICE_URL;

export async function POST(request: NextRequest) {
  if (!serviceUrl) {
    return NextResponse.json({ error: 'Service not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const response = await fetch(`${serviceUrl}/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json({ error: `Service error: ${errorData}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to connect to mortgage service' }, { status: 500 });
  }
}
