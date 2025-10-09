"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { MortgageInputGrid } from '@/components/mortgage/mortgage-input-grid'
import { MortgageCostGrid } from '@/components/mortgage/mortgage-cost-grid'
import { MortgageResultsCard } from '@/components/mortgage/mortgage-results-card'
import { useMortgageCalculator } from '@/hooks/use-mortgage-calculator'
import type { MortgageCostField } from '@/lib/mortgage/types'
import { cn } from '@/lib/utils'
import { SPACING_TOKENS, SURFACE_TOKENS, TYPOGRAPHY_TOKENS } from '@/lib/design-tokens'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

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

  const faqItems = [
    {
      question: 'How much should I put down on a home?',
      answer:
        'Many lenders prefer a 20% down payment to avoid private mortgage insurance (PMI), but programs exist with lower down payments. This calculator helps you see how different down payment amounts impact your total payment.',
    },
    {
      question: 'What is PMI and when can I remove it?',
      answer:
        'Private Mortgage Insurance protects lenders when borrowers put down less than 20%. PMI can often be removed once you reach 20% equity through payments or home appreciation, reducing your monthly costs.',
    },
    {
      question: 'Should property taxes and insurance be included in the estimate?',
      answer:
        'Including taxes, insurance, HOA fees, and other carrying costs provides a more realistic view of your monthly obligation. Toggle these in the calculator to see how they affect your total payment.',
    },
  ]

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
    <div className={SPACING_TOKENS.section}>
      <Card className={cn('border', SURFACE_TOKENS.primary)}>
        <CardHeader>
          <CardTitle className={TYPOGRAPHY_TOKENS.heading}>Mortgage FAQs</CardTitle>
          <CardDescription className={TYPOGRAPHY_TOKENS.subheading}>
            Learn how different levers in this calculator impact your payment and financial planning.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={item.question}
                value={`faq-${index}`}
                className={cn('rounded-lg border px-3', SURFACE_TOKENS.secondary)}
              >
                <AccordionTrigger className="text-left text-sm font-medium text-foreground">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card className={cn('border', SURFACE_TOKENS.primary)}>
        <CardHeader>
          <CardTitle className={TYPOGRAPHY_TOKENS.heading}>💰 Mortgage Calculator</CardTitle>
          <CardDescription className={TYPOGRAPHY_TOKENS.subheading}>
            Adjust your inputs to see how your monthly payment responds.
          </CardDescription>
        </CardHeader>
        <CardContent className={SPACING_TOKENS.section}>
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

          <Separator className="bg-border/60" />

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
