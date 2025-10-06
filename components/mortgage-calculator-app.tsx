"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { MortgageInputGrid } from '@/components/mortgage/mortgage-input-grid'
import { MortgageCostGrid } from '@/components/mortgage/mortgage-cost-grid'
import { MortgageResultsCard } from '@/components/mortgage/mortgage-results-card'
import { useMortgageCalculator } from '@/hooks/use-mortgage-calculator'
import type { MortgageCostField } from '@/lib/mortgage/types'

export function MortgageCalculatorApp() {
  const {
    inputs,
    setInput,
    setCostValue,
    setCostType,
    setIncludeTaxesAndCosts,
    result,
    error,
    loading,
    calculate,
  } = useMortgageCalculator()

  const costFields: MortgageCostField[] = [
    {
      label: 'Property Taxes',
      value: inputs.propertyTaxes,
      type: inputs.propertyTaxType,
      onValueChange: (value) => setCostValue('propertyTaxes', value),
      onTypeChange: (value) => setCostType('propertyTaxes', value),
      inputId: 'propertyTaxes',
      selectId: 'propertyTaxesType',
    },
    {
      label: 'Home Insurance',
      value: inputs.homeInsurance,
      type: inputs.homeInsuranceType,
      onValueChange: (value) => setCostValue('homeInsurance', value),
      onTypeChange: (value) => setCostType('homeInsurance', value),
      inputId: 'homeInsurance',
      selectId: 'homeInsuranceType',
    },
    {
      label: 'PMI Insurance',
      value: inputs.pmiInsurance,
      type: inputs.pmiInsuranceType,
      onValueChange: (value) => setCostValue('pmiInsurance', value),
      onTypeChange: (value) => setCostType('pmiInsurance', value),
      inputId: 'pmiInsurance',
      selectId: 'pmiInsuranceType',
    },
    {
      label: 'HOA Fee',
      value: inputs.hoaFee,
      type: inputs.hoaFeeType,
      onValueChange: (value) => setCostValue('hoaFee', value),
      onTypeChange: (value) => setCostType('hoaFee', value),
      inputId: 'hoaFee',
      selectId: 'hoaFeeType',
    },
    {
      label: 'Other Costs',
      value: inputs.otherCosts,
      type: inputs.otherCostsType,
      onValueChange: (value) => setCostValue('otherCosts', value),
      onTypeChange: (value) => setCostType('otherCosts', value),
      inputId: 'otherCosts',
      selectId: 'otherCostsType',
    },
  ]

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>💰 Mortgage Calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MortgageInputGrid
            homePrice={inputs.homePrice}
            downPayment={inputs.downPayment}
            interestRate={inputs.interestRate}
            loanTerm={inputs.loanTerm}
            onHomePriceChange={(value) => setInput('homePrice', value)}
            onDownPaymentChange={(value) => setInput('downPayment', value)}
            onInterestRateChange={(value) => setInput('interestRate', value)}
            onLoanTermChange={(value) => setInput('loanTerm', value)}
          />

          <Separator />

          <MortgageCostGrid
            includeTaxesAndCosts={inputs.includeTaxesAndCosts}
            onIncludeTaxesAndCostsChange={setIncludeTaxesAndCosts}
            fields={costFields}
          />

          <div className="flex justify-end">
            <Button onClick={() => void calculate()} disabled={loading}>
              {loading ? 'Calculating...' : 'Calculate Mortgage'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <MortgageResultsCard result={result} error={error} />
    </div>
  )
}
