export interface MortgageParams {
  homePrice: number
  downPayment: number
  interestRate: number
  loanTerm: number
  startDate: Date
  propertyTaxes: number
  homeInsurance: number
  pmi: number
  hoaFees: number
}

export interface AmortizationEntry {
  month: number
  interest: number
  principal: number
  balance: number
}

export interface MortgageCalculationResult {
  monthlyPayment: number
  monthlyPrincipalAndInterest: number
  monthlyTaxes: number
  monthlyInsurance: number
  monthlyPmi: number
  monthlyHoa: number
  totalInterestPaid: number
  amortization: AmortizationEntry[]
}

const toCents = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

export const calculateMortgage = (params: MortgageParams): MortgageCalculationResult => {
  const loanAmount = params.homePrice - params.downPayment
  const numberOfPayments = params.loanTerm * 12

  if (!Number.isFinite(loanAmount) || loanAmount < 0) {
    throw new Error("Loan amount must be zero or greater")
  }

  if (!Number.isFinite(numberOfPayments) || numberOfPayments <= 0) {
    throw new Error("Loan term must be greater than zero")
  }

  const monthlyInterestRate = params.interestRate / 100 / 12

  let monthlyPrincipalAndInterest: number
  if (loanAmount === 0) {
    monthlyPrincipalAndInterest = 0
  } else if (monthlyInterestRate === 0) {
    monthlyPrincipalAndInterest = loanAmount / numberOfPayments
  } else {
    const factor = Math.pow(1 + monthlyInterestRate, numberOfPayments)
    monthlyPrincipalAndInterest = loanAmount * ((monthlyInterestRate * factor) / (factor - 1))
  }

  const monthlyTaxes = params.propertyTaxes / 12
  const monthlyInsurance = params.homeInsurance / 12
  const monthlyPmi = params.pmi / 12
  const monthlyHoa = params.hoaFees

  const totalMonthlyPayment =
    monthlyPrincipalAndInterest +
    monthlyTaxes +
    monthlyInsurance +
    monthlyPmi +
    monthlyHoa

  const amortization: AmortizationEntry[] = []
  let balance = loanAmount
  let totalInterestPaid = 0

  if (loanAmount > 0 && monthlyInterestRate >= 0) {
    for (let i = 1; i <= numberOfPayments; i++) {
      const interest = balance * monthlyInterestRate
      let principal = monthlyPrincipalAndInterest - interest

      if (principal > balance) {
        principal = balance
      }

      balance -= principal
      totalInterestPaid += interest

      amortization.push({
        month: i,
        interest: toCents(interest),
        principal: toCents(principal),
        balance: toCents(Math.max(balance, 0)),
      })

      if (balance <= 0) {
        break
      }
    }
  }

  return {
    monthlyPayment: toCents(totalMonthlyPayment),
    monthlyPrincipalAndInterest: toCents(monthlyPrincipalAndInterest),
    monthlyTaxes: toCents(monthlyTaxes),
    monthlyInsurance: toCents(monthlyInsurance),
    monthlyPmi: toCents(monthlyPmi),
    monthlyHoa: toCents(monthlyHoa),
    totalInterestPaid: toCents(totalInterestPaid),
    amortization,
  }
}
