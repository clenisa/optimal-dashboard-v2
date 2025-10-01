import { NextRequest, NextResponse } from 'next/server';

interface MortgageParams {
  homePrice: number;
  downPayment: number;
  interestRate: number;
  loanTerm: number;
}

interface MortgageResult {
  monthlyPayment: number;
}

function calculateMortgage(params: MortgageParams): MortgageResult {
  const { homePrice, downPayment, interestRate, loanTerm } = params;
  const loanAmount = homePrice - downPayment;
  const monthlyInterestRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;

  if (loanAmount <= 0) {
    return { monthlyPayment: 0 };
  }

  if (monthlyInterestRate === 0) {
    return { monthlyPayment: loanAmount / numberOfPayments };
  }

  const monthlyPayment =
    loanAmount *
    (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
    (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

  return { monthlyPayment };
}

function validateMortgageParams(body: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (typeof body.homePrice !== 'number' || body.homePrice <= 0) {
    errors.push('homePrice must be a positive number');
  }

  if (typeof body.downPayment !== 'number' || body.downPayment < 0) {
    errors.push('downPayment must be a non-negative number');
  }

  if (typeof body.interestRate !== 'number' || body.interestRate < 0) {
    errors.push('interestRate must be a non-negative number');
  }

  if (typeof body.loanTerm !== 'number' || body.loanTerm <= 0) {
    errors.push('loanTerm must be a positive number');
  }

  if (errors.length === 0 && body.downPayment > body.homePrice) {
    errors.push('downPayment cannot be greater than homePrice');
  }

  return { valid: errors.length === 0, errors };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = validateMortgageParams(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Invalid input parameters',
          details: validation.errors,
        },
        { status: 400 },
      );
    }

    const result = calculateMortgage(body);

    if (isNaN(result.monthlyPayment)) {
      return NextResponse.json(
        {
          error: 'Calculation resulted in invalid value',
        },
        { status: 500 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Invalid request format',
      },
      { status: 400 },
    );
  }
}
