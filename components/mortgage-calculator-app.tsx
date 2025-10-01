"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function MortgageCalculatorApp() {
  const [homePrice, setHomePrice] = useState(450000);
  const [downPayment, setDownPayment] = useState(90000);
  const [interestRate, setInterestRate] = useState(6.25);
  const [loanTerm, setLoanTerm] = useState(30);
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    setMonthlyPayment(null);

    try {
      const response = await fetch('/api/mortgage-calculator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ homePrice, downPayment, interestRate, loanTerm }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate mortgage');
      }

      const result = await response.json();
      setMonthlyPayment(result.monthlyPayment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>💰 Mortgage Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="homePrice">Home Price</Label>
            <Input id="homePrice" type="number" value={homePrice} onChange={(e) => setHomePrice(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="downPayment">Down Payment</Label>
            <Input id="downPayment" type="number" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interestRate">Interest Rate (%)</Label>
            <Input id="interestRate" type="number" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loanTerm">Loan Term (Years)</Label>
            <Input id="loanTerm" type="number" value={loanTerm} onChange={(e) => setLoanTerm(Number(e.target.value))} />
          </div>
        </div>
        <Button onClick={handleCalculate} disabled={loading}>
          {loading ? 'Calculating...' : 'Calculate'}
        </Button>
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {monthlyPayment !== null && (
          <Alert>
            <AlertTitle>Your Estimated Monthly Payment:</AlertTitle>
            <AlertDescription className="text-2xl font-bold">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(monthlyPayment)}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
