import { NextRequest, NextResponse } from 'next/server';

interface MortgageParams {
  homePrice: number;
  downPayment: number;
  interestRate: number;
  loanTerm: number;
  includeTaxesAndCosts: boolean;
  propertyTaxes: number;
  propertyTaxType: 'percent' | 'dollar';
  homeInsurance: number;
  homeInsuranceType: 'percent' | 'dollar';
  pmiInsurance: number;
  pmiInsuranceType: 'percent' | 'dollar';
  hoaFee: number;
  hoaFeeType: 'percent' | 'dollar';
  otherCosts: number;
  otherCostsType: 'percent' | 'dollar';
}

interface MortgageResult {
  monthlyPayment: number;
  loanAmount: number;
  totalInterest: number;
  monthlyBreakdown: {
    principalAndInterest: number;
    propertyTax: number;
    homeInsurance: number;
    pmiInsurance: number;
    hoaFee: number;
    otherCosts: number;
    totalMonthlyPayment: number;
  };
  annualBreakdown: {
    principalAndInterest: number;
    propertyTax: number;
    homeInsurance: number;
    pmiInsurance: number;
    hoaFee: number;
    otherCosts: number;
    totalAnnualPayment: number;
  };
}

function calculateMortgage(params: MortgageParams): MortgageResult {
  const { homePrice, downPayment, interestRate, loanTerm } = params;
  const loanAmount = homePrice - downPayment;
  const monthlyInterestRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;

  let monthlyPrincipalAndInterest = 0;

  if (loanAmount <= 0) {
    monthlyPrincipalAndInterest = 0;
  } else if (monthlyInterestRate === 0) {
    monthlyPrincipalAndInterest = loanAmount / numberOfPayments;
  } else {
    monthlyPrincipalAndInterest =
      loanAmount *
      (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
  }

  const totalInterest = monthlyPrincipalAndInterest * numberOfPayments - loanAmount;

  let monthlyPropertyTax = 0;
  let monthlyHomeInsurance = 0;
  let monthlyPmiInsurance = 0;
  let monthlyHoaFee = 0;
  let monthlyOtherCosts = 0;

  if (params.includeTaxesAndCosts) {
    if (params.propertyTaxType === 'percent') {
      monthlyPropertyTax = (homePrice * params.propertyTaxes) / 100 / 12;
    } else {
      monthlyPropertyTax = params.propertyTaxes / 12;
    }

    if (params.homeInsuranceType === 'percent') {
      monthlyHomeInsurance = (homePrice * params.homeInsurance) / 100 / 12;
    } else {
      monthlyHomeInsurance = params.homeInsurance / 12;
    }

    if (params.pmiInsuranceType === 'percent') {
      monthlyPmiInsurance = (loanAmount * params.pmiInsurance) / 100 / 12;
    } else {
      monthlyPmiInsurance = params.pmiInsurance / 12;
    }

    if (params.hoaFeeType === 'percent') {
      monthlyHoaFee = (homePrice * params.hoaFee) / 100 / 12;
    } else {
      monthlyHoaFee = params.hoaFee / 12;
    }

    if (params.otherCostsType === 'percent') {
      monthlyOtherCosts = (homePrice * params.otherCosts) / 100 / 12;
    } else {
      monthlyOtherCosts = params.otherCosts / 12;
    }
  }

  const totalMonthlyPayment =
    monthlyPrincipalAndInterest +
    monthlyPropertyTax +
    monthlyHomeInsurance +
    monthlyPmiInsurance +
    monthlyHoaFee +
    monthlyOtherCosts;

  return {
    monthlyPayment: monthlyPrincipalAndInterest,
    loanAmount,
    totalInterest,
    monthlyBreakdown: {
      principalAndInterest: monthlyPrincipalAndInterest,
      propertyTax: monthlyPropertyTax,
      homeInsurance: monthlyHomeInsurance,
      pmiInsurance: monthlyPmiInsurance,
      hoaFee: monthlyHoaFee,
      otherCosts: monthlyOtherCosts,
      totalMonthlyPayment,
    },
    annualBreakdown: {
      principalAndInterest: monthlyPrincipalAndInterest * 12,
      propertyTax: monthlyPropertyTax * 12,
      homeInsurance: monthlyHomeInsurance * 12,
      pmiInsurance: monthlyPmiInsurance * 12,
      hoaFee: monthlyHoaFee * 12,
      otherCosts: monthlyOtherCosts * 12,
      totalAnnualPayment: totalMonthlyPayment * 12,
    },
  };
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

  if (typeof body.includeTaxesAndCosts !== 'boolean') {
    errors.push('includeTaxesAndCosts must be a boolean');
  }

  if (body.includeTaxesAndCosts) {
    const additionalFields = ['propertyTaxes', 'homeInsurance', 'pmiInsurance', 'hoaFee', 'otherCosts'];

    additionalFields.forEach((field) => {
      if (typeof body[field] !== 'number' || body[field] < 0) {
        errors.push(`${field} must be a non-negative number`);
      }
    });

    const typeFields = [
      'propertyTaxType',
      'homeInsuranceType',
      'pmiInsuranceType',
      'hoaFeeType',
      'otherCostsType',
    ];

    typeFields.forEach((field) => {
      if (!['percent', 'dollar'].includes(body[field])) {
        errors.push(`${field} must be either 'percent' or 'dollar'`);
      }
    });
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
