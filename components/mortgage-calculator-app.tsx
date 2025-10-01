"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

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

export function MortgageCalculatorApp() {
  const [homePrice, setHomePrice] = useState(450000);
  const [downPayment, setDownPayment] = useState(90000);
  const [interestRate, setInterestRate] = useState(6.25);
  const [loanTerm, setLoanTerm] = useState(30);

  const [includeTaxesAndCosts, setIncludeTaxesAndCosts] = useState(true);

  const [propertyTaxes, setPropertyTaxes] = useState(1.2);
  const [propertyTaxType, setPropertyTaxType] = useState<'percent' | 'dollar'>('percent');
  const [homeInsurance, setHomeInsurance] = useState(1500);
  const [homeInsuranceType, setHomeInsuranceType] = useState<'percent' | 'dollar'>('dollar');
  const [pmiInsurance, setPmiInsurance] = useState(0);
  const [pmiInsuranceType, setPmiInsuranceType] = useState<'percent' | 'dollar'>('dollar');
  const [hoaFee, setHoaFee] = useState(0);
  const [hoaFeeType, setHoaFeeType] = useState<'percent' | 'dollar'>('dollar');
  const [otherCosts, setOtherCosts] = useState(0);
  const [otherCostsType, setOtherCostsType] = useState<'percent' | 'dollar'>('dollar');

  const [result, setResult] = useState<MortgageResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/mortgage-calculator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          homePrice,
          downPayment,
          interestRate,
          loanTerm,
          includeTaxesAndCosts,
          propertyTaxes,
          propertyTaxType,
          homeInsurance,
          homeInsuranceType,
          pmiInsurance,
          pmiInsuranceType,
          hoaFee,
          hoaFeeType,
          otherCosts,
          otherCostsType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to calculate mortgage');
      }

      const calculationResult = await response.json();
      setResult(calculationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>💰 Mortgage Calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="homePrice">Home Price</Label>
              <Input
                id="homePrice"
                type="number"
                value={homePrice}
                onChange={(e) => setHomePrice(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="downPayment">Down Payment</Label>
              <Input
                id="downPayment"
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.01"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loanTerm">Loan Term (Years)</Label>
              <Input
                id="loanTerm"
                type="number"
                value={loanTerm}
                onChange={(e) => setLoanTerm(Number(e.target.value))}
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeTaxesAndCosts"
              checked={includeTaxesAndCosts}
              onCheckedChange={(checked) => setIncludeTaxesAndCosts(checked as boolean)}
            />
            <Label htmlFor="includeTaxesAndCosts" className="font-medium">
              Include Taxes & Costs Below
            </Label>
          </div>

          {includeTaxesAndCosts && (
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
                Annual Tax & Cost
              </h4>

              <div className="grid grid-cols-3 gap-2 items-end">
                <div className="space-y-2">
                  <Label htmlFor="propertyTaxes" className="text-sm">
                    Property Taxes
                  </Label>
                  <Input
                    id="propertyTaxes"
                    type="number"
                    step="0.01"
                    value={propertyTaxes}
                    onChange={(e) => setPropertyTaxes(Number(e.target.value))}
                  />
                </div>
                <Select
                  value={propertyTaxType}
                  onValueChange={(value: 'percent' | 'dollar') => setPropertyTaxType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">%</SelectItem>
                    <SelectItem value="dollar">$</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-2 items-end">
                <div className="space-y-2">
                  <Label htmlFor="homeInsurance" className="text-sm">
                    Home Insurance
                  </Label>
                  <Input
                    id="homeInsurance"
                    type="number"
                    value={homeInsurance}
                    onChange={(e) => setHomeInsurance(Number(e.target.value))}
                  />
                </div>
                <Select
                  value={homeInsuranceType}
                  onValueChange={(value: 'percent' | 'dollar') => setHomeInsuranceType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">%</SelectItem>
                    <SelectItem value="dollar">$</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-2 items-end">
                <div className="space-y-2">
                  <Label htmlFor="pmiInsurance" className="text-sm">
                    PMI Insurance
                  </Label>
                  <Input
                    id="pmiInsurance"
                    type="number"
                    value={pmiInsurance}
                    onChange={(e) => setPmiInsurance(Number(e.target.value))}
                  />
                </div>
                <Select
                  value={pmiInsuranceType}
                  onValueChange={(value: 'percent' | 'dollar') => setPmiInsuranceType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">%</SelectItem>
                    <SelectItem value="dollar">$</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-2 items-end">
                <div className="space-y-2">
                  <Label htmlFor="hoaFee" className="text-sm">
                    HOA Fee
                  </Label>
                  <Input
                    id="hoaFee"
                    type="number"
                    value={hoaFee}
                    onChange={(e) => setHoaFee(Number(e.target.value))}
                  />
                </div>
                <Select value={hoaFeeType} onValueChange={(value: 'percent' | 'dollar') => setHoaFeeType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">%</SelectItem>
                    <SelectItem value="dollar">$</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-2 items-end">
                <div className="space-y-2">
                  <Label htmlFor="otherCosts" className="text-sm">
                    Other Costs
                  </Label>
                  <Input
                    id="otherCosts"
                    type="number"
                    value={otherCosts}
                    onChange={(e) => setOtherCosts(Number(e.target.value))}
                  />
                </div>
                <Select
                  value={otherCostsType}
                  onValueChange={(value: 'percent' | 'dollar') => setOtherCostsType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">%</SelectItem>
                    <SelectItem value="dollar">$</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Button onClick={handleCalculate} disabled={loading} className="w-full">
            {loading ? 'Calculating...' : 'Calculate'}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Monthly Payment Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="font-semibold">Total Monthly Payment:</span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(result.monthlyBreakdown.totalMonthlyPayment)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Mortgage Payment (P&I):</span>
                      <span className="font-medium">
                        {formatCurrency(result.monthlyBreakdown.principalAndInterest)}
                      </span>
                    </div>

                    {includeTaxesAndCosts && (
                      <>
                        {result.monthlyBreakdown.propertyTax > 0 && (
                          <div className="flex justify-between">
                            <span>Property Tax:</span>
                            <span className="font-medium">
                              {formatCurrency(result.monthlyBreakdown.propertyTax)}
                            </span>
                          </div>
                        )}
                        {result.monthlyBreakdown.homeInsurance > 0 && (
                          <div className="flex justify-between">
                            <span>Home Insurance:</span>
                            <span className="font-medium">
                              {formatCurrency(result.monthlyBreakdown.homeInsurance)}
                            </span>
                          </div>
                        )}
                        {result.monthlyBreakdown.pmiInsurance > 0 && (
                          <div className="flex justify-between">
                            <span>PMI Insurance:</span>
                            <span className="font-medium">
                              {formatCurrency(result.monthlyBreakdown.pmiInsurance)}
                            </span>
                          </div>
                        )}
                        {result.monthlyBreakdown.hoaFee > 0 && (
                          <div className="flex justify-between">
                            <span>HOA Fee:</span>
                            <span className="font-medium">
                              {formatCurrency(result.monthlyBreakdown.hoaFee)}
                            </span>
                          </div>
                        )}
                        {result.monthlyBreakdown.otherCosts > 0 && (
                          <div className="flex justify-between">
                            <span>Other Costs:</span>
                            <span className="font-medium">
                              {formatCurrency(result.monthlyBreakdown.otherCosts)}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <Separator />

                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Loan Amount:</span>
                      <span>{formatCurrency(result.loanAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Interest:</span>
                      <span>{formatCurrency(result.totalInterest)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
