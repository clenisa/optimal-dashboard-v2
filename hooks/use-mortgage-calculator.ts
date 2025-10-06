"use client"

import { useCallback, useState } from 'react'
import { DEFAULT_MORTGAGE_INPUTS } from '@/lib/mortgage/constants'
import type { MortgageInputs, MortgageResult, MortgageCostType } from '@/lib/mortgage/types'

interface UseMortgageCalculatorResult {
  inputs: MortgageInputs
  setInput: <Key extends keyof MortgageInputs>(key: Key, value: MortgageInputs[Key]) => void
  setCostValue: (key: keyof MortgageInputs, value: number) => void
  setCostType: (key: keyof MortgageInputs, value: MortgageCostType) => void
  result: MortgageResult | null
  error: string | null
  loading: boolean
  calculate: () => Promise<void>
  setIncludeTaxesAndCosts: (next: boolean) => void
}

const COST_VALUE_FIELDS: Array<keyof MortgageInputs> = [
  'propertyTaxes',
  'homeInsurance',
  'pmiInsurance',
  'hoaFee',
  'otherCosts',
]

const COST_TYPE_FIELDS: Record<keyof MortgageInputs, keyof MortgageInputs> = {
  homePrice: 'homePrice',
  downPayment: 'downPayment',
  interestRate: 'interestRate',
  loanTerm: 'loanTerm',
  includeTaxesAndCosts: 'includeTaxesAndCosts',
  propertyTaxes: 'propertyTaxType',
  propertyTaxType: 'propertyTaxType',
  homeInsurance: 'homeInsuranceType',
  homeInsuranceType: 'homeInsuranceType',
  pmiInsurance: 'pmiInsuranceType',
  pmiInsuranceType: 'pmiInsuranceType',
  hoaFee: 'hoaFeeType',
  hoaFeeType: 'hoaFeeType',
  otherCosts: 'otherCostsType',
  otherCostsType: 'otherCostsType',
}

export function useMortgageCalculator(): UseMortgageCalculatorResult {
  const [inputs, setInputs] = useState<MortgageInputs>(DEFAULT_MORTGAGE_INPUTS)
  const [result, setResult] = useState<MortgageResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const setInput = useCallback(
    (key: keyof MortgageInputs, value: MortgageInputs[keyof MortgageInputs]) => {
      setInputs((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  const setIncludeTaxesAndCosts = useCallback(
    (next: boolean) => {
      setInputs((prev) => ({ ...prev, includeTaxesAndCosts: next }))
    },
    [],
  )

  const setCostValue = useCallback(
    (key: keyof MortgageInputs, value: number) => {
      if (!COST_VALUE_FIELDS.includes(key)) return
      setInputs((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  const setCostType = useCallback(
    (key: keyof MortgageInputs, value: MortgageCostType) => {
      const typeField = COST_TYPE_FIELDS[key]
      if (!typeField) return
      setInputs((prev) => ({ ...prev, [typeField]: value }))
    },
    [],
  )

  const calculate = useCallback(async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/mortgage-calculator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputs),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to calculate mortgage')
      }

      const calculationResult = await response.json()
      setResult(calculationResult)
    } catch (calcError) {
      setError(calcError instanceof Error ? calcError.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [inputs])

  return {
    inputs,
    setInput,
    setCostValue,
    setCostType,
    setIncludeTaxesAndCosts,
    result,
    error,
    loading,
    calculate,
  }
}
