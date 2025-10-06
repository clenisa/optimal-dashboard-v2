"use client"

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface MortgageInputGridProps {
  homePrice: number
  downPayment: number
  interestRate: number
  loanTerm: number
  onHomePriceChange: (value: number) => void
  onDownPaymentChange: (value: number) => void
  onInterestRateChange: (value: number) => void
  onLoanTermChange: (value: number) => void
}

export function MortgageInputGrid({
  homePrice,
  downPayment,
  interestRate,
  loanTerm,
  onHomePriceChange,
  onDownPaymentChange,
  onInterestRateChange,
  onLoanTermChange,
}: MortgageInputGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Field
        id="homePrice"
        label="Home Price"
        value={homePrice}
        onChange={(value) => onHomePriceChange(value)}
      />
      <Field
        id="downPayment"
        label="Down Payment"
        value={downPayment}
        onChange={(value) => onDownPaymentChange(value)}
      />
      <Field
        id="interestRate"
        label="Interest Rate (%)"
        value={interestRate}
        step={0.01}
        onChange={(value) => onInterestRateChange(value)}
      />
      <Field
        id="loanTerm"
        label="Loan Term (Years)"
        value={loanTerm}
        onChange={(value) => onLoanTermChange(value)}
      />
    </div>
  )
}

function Field({
  id,
  label,
  value,
  step,
  onChange,
}: {
  id: string
  label: string
  value: number
  step?: number
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        value={value}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  )
}
