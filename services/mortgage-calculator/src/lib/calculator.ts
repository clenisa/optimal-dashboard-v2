export interface MortgageParams {
  homePrice: number;
  downPayment: number;
  interestRate: number;
  loanTerm: number;
}

export interface MortgageResult {
  monthlyPayment: number;
}

export const calculateMortgage = (params: MortgageParams): MortgageResult => {
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
};
