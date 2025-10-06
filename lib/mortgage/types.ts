export interface MortgageInputs {
  homePrice: number
  downPayment: number
  interestRate: number
  loanTerm: number
  includeTaxesAndCosts: boolean
  propertyTaxes: number
  propertyTaxType: 'percent' | 'dollar'
  homeInsurance: number
  homeInsuranceType: 'percent' | 'dollar'
  pmiInsurance: number
  pmiInsuranceType: 'percent' | 'dollar'
  hoaFee: number
  hoaFeeType: 'percent' | 'dollar'
  otherCosts: number
  otherCostsType: 'percent' | 'dollar'
}

export interface MortgageBreakdown {
  principalAndInterest: number
  propertyTax: number
  homeInsurance: number
  pmiInsurance: number
  hoaFee: number
  otherCosts: number
  totalMonthlyPayment: number
}

export interface MortgageResult {
  monthlyPayment: number
  loanAmount: number
  totalInterest: number
  monthlyBreakdown: MortgageBreakdown
  annualBreakdown: MortgageBreakdown & { totalAnnualPayment: number }
}

export type MortgageCostType = 'percent' | 'dollar'

export interface MortgageCostField {
  label: string
  value: number
  type: MortgageCostType
  onValueChange: (next: number) => void
  onTypeChange: (next: MortgageCostType) => void
  inputId: string
  selectId: string
}
