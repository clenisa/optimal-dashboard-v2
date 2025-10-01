"use client"

import { useState, type ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface MortgageFormState {
  homePrice: number
  downPayment: number
  interestRate: number
  loanTerm: number
  startDate: string
  propertyTaxes: number
  homeInsurance: number
  pmi: number
  hoaFees: number
}

interface AmortizationEntry {
  month: number
  interest: number
  principal: number
  balance: number
}

interface MortgageResult {
  monthlyPayment: number
  monthlyPrincipalAndInterest: number
  monthlyTaxes: number
  monthlyInsurance: number
  monthlyPmi: number
  monthlyHoa: number
  totalInterestPaid: number
  amortization: AmortizationEntry[]
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const getServiceUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_MORTGAGE_CALCULATOR_URL || "http://localhost:3004"
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl
}

const todayISO = () => new Date().toISOString().slice(0, 10)

const createDefaultFormState = (): MortgageFormState => ({
  homePrice: 450000,
  downPayment: 90000,
  interestRate: 6.25,
  loanTerm: 30,
  startDate: todayISO(),
  propertyTaxes: 6000,
  homeInsurance: 1200,
  pmi: 0,
  hoaFees: 125,
})

export function MortgageCalculatorApp() {
  const [form, setForm] = useState<MortgageFormState>(() => createDefaultFormState())
  const [result, setResult] = useState<MortgageResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleNumberChange = (field: keyof MortgageFormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      setForm((prev) => ({
        ...prev,
        [field]: value === "" ? 0 : Number.parseFloat(value),
      }))
    }

  const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      startDate: event.target.value,
    }))
  }

  const handleCalculate = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${getServiceUrl()}/calculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          startDate: form.startDate ? new Date(form.startDate).toISOString() : new Date().toISOString(),
        }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to calculate mortgage")
      }

      setResult(payload as MortgageResult)
    } catch (err) {
      setResult(null)
      setError(err instanceof Error ? err.message : "Unexpected error calculating mortgage")
    } finally {
      setLoading(false)
    }
  }

  const totalPrincipal = result?.amortization.reduce((sum, entry) => sum + entry.principal, 0) ?? 0
  const totalInterest = result?.amortization.reduce((sum, entry) => sum + entry.interest, 0) ?? 0

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mortgage Calculator 🤑</CardTitle>
          <CardDescription>
            Estimate your monthly mortgage payment with taxes, insurance, PMI, and HOA fees included.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="homePrice">Home Price</Label>
              <Input
                id="homePrice"
                type="number"
                inputMode="decimal"
                value={form.homePrice}
                onChange={handleNumberChange("homePrice")}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="downPayment">Down Payment</Label>
              <Input
                id="downPayment"
                type="number"
                inputMode="decimal"
                value={form.downPayment}
                onChange={handleNumberChange("downPayment")}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <Input
                id="interestRate"
                type="number"
                inputMode="decimal"
                step="0.01"
                value={form.interestRate}
                onChange={handleNumberChange("interestRate")}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loanTerm">Loan Term (years)</Label>
              <Input
                id="loanTerm"
                type="number"
                inputMode="decimal"
                value={form.loanTerm}
                onChange={handleNumberChange("loanTerm")}
                min={1}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={handleDateChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="propertyTaxes">Annual Property Taxes</Label>
              <Input
                id="propertyTaxes"
                type="number"
                inputMode="decimal"
                value={form.propertyTaxes}
                onChange={handleNumberChange("propertyTaxes")}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="homeInsurance">Annual Home Insurance</Label>
              <Input
                id="homeInsurance"
                type="number"
                inputMode="decimal"
                value={form.homeInsurance}
                onChange={handleNumberChange("homeInsurance")}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pmi">Annual PMI</Label>
              <Input
                id="pmi"
                type="number"
                inputMode="decimal"
                value={form.pmi}
                onChange={handleNumberChange("pmi")}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hoaFees">Monthly HOA Fees</Label>
              <Input
                id="hoaFees"
                type="number"
                inputMode="decimal"
                value={form.hoaFees}
                onChange={handleNumberChange("hoaFees")}
                min={0}
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Calculation error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleCalculate} disabled={loading}>
              {loading ? "Calculating..." : "Calculate"}
            </Button>
            {result && (
              <Button
                variant="outline"
                onClick={() => {
                  setForm(createDefaultFormState())
                  setResult(null)
                  setError(null)
                }}
                disabled={loading}
              >
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
          <Card className="order-2 lg:order-1">
            <CardHeader>
              <CardTitle>Amortization Schedule</CardTitle>
              <CardDescription>Track how each monthly payment is split between principal and interest.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[360px] pr-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Month</TableHead>
                      <TableHead>Principal</TableHead>
                      <TableHead>Interest</TableHead>
                      <TableHead>Remaining Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.amortization.map((entry) => (
                      <TableRow key={entry.month}>
                        <TableCell>{entry.month}</TableCell>
                        <TableCell>{currencyFormatter.format(entry.principal)}</TableCell>
                        <TableCell>{currencyFormatter.format(entry.interest)}</TableCell>
                        <TableCell>{currencyFormatter.format(entry.balance)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableCaption>
                    Total Principal Paid: {currencyFormatter.format(totalPrincipal)} • Total Interest Paid: {currencyFormatter.format(totalInterest)}
                  </TableCaption>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="order-1 lg:order-2">
            <CardHeader>
              <CardTitle>Monthly Payment Summary</CardTitle>
              <CardDescription>Your estimated payment including escrow and association fees.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between border-b pb-2 text-base font-semibold">
                <span>Total Monthly Payment</span>
                <span>{currencyFormatter.format(result.monthlyPayment)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Principal &amp; Interest</span>
                <span>{currencyFormatter.format(result.monthlyPrincipalAndInterest)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Property Taxes</span>
                <span>{currencyFormatter.format(result.monthlyTaxes)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Home Insurance</span>
                <span>{currencyFormatter.format(result.monthlyInsurance)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>PMI</span>
                <span>{currencyFormatter.format(result.monthlyPmi)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>HOA Fees</span>
                <span>{currencyFormatter.format(result.monthlyHoa)}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <span>Total Interest (life of loan)</span>
                <span>{currencyFormatter.format(result.totalInterestPaid)}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Loan Balance Paid Off</span>
                <span>{currencyFormatter.format(totalPrincipal)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
