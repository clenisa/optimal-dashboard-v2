"use client"

import { TransactionData } from "@/lib/chart-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrencyDisplay } from "@/lib/currency-utils"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TransactionSummaryProps {
  transactions: TransactionData[]
}

export function TransactionSummary({ transactions }: TransactionSummaryProps) {
  const hasType = transactions.some(t => typeof (t as any).type === 'string')

  const totalIncome = hasType
    ? transactions
        .filter((t) => (t as any).type === 'income')
        .reduce((acc, t) => acc + t.amount, 0)
    : transactions
        .filter((t) => t.amount > 0)
        .reduce((acc, t) => acc + t.amount, 0)

  const totalExpenses = hasType
    ? transactions
        .filter((t) => (t as any).type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0)
    : transactions
        .filter((t) => t.amount < 0)
        .reduce((acc, t) => acc + Math.abs(t.amount), 0)

  const netBalance = hasType
    ? totalIncome - totalExpenses
    : totalIncome - totalExpenses

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Summary
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Income:</strong> {hasType 
                      ? "All transactions marked as 'income' type" 
                      : "All transactions with positive amounts (amount > 0)"
                    }
                  </div>
                  <div>
                    <strong>Expenses:</strong> {hasType 
                      ? "All transactions marked as 'expense' type" 
                      : "All transactions with negative amounts (converted to positive)"
                    }
                  </div>
                  <div>
                    <strong>Balance:</strong> Income minus Expenses
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span>Income:</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="text-sm">
                      {hasType ? (
                        <>
                          <strong>Includes:</strong> Salary, bonuses, freelance income, investment returns, gifts, refunds<br/>
                          <strong>Excludes:</strong> Transfers between your own accounts, loan proceeds
                        </>
                      ) : (
                        <>
                          <strong>Includes:</strong> All positive amounts (money coming in)<br/>
                          <strong>Note:</strong> May include transfers if not properly categorized
                        </>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-green-500 font-medium">{formatCurrencyDisplay(totalIncome)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span>Expenses:</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="text-sm">
                      {hasType ? (
                        <>
                          <strong>Includes:</strong> Groceries, rent, utilities, entertainment, subscriptions, gas, dining out<br/>
                          <strong>Excludes:</strong> Transfers between your own accounts, loan payments (principal)
                        </>
                      ) : (
                        <>
                          <strong>Includes:</strong> All negative amounts (money going out)<br/>
                          <strong>Note:</strong> May include transfers if not properly categorized
                        </>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-red-500 font-medium">{formatCurrencyDisplay(totalExpenses)}</span>
          </div>
          
          <div className="flex justify-between items-center border-t pt-2">
            <div className="flex items-center gap-2">
              <span className="font-bold">Balance:</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="text-sm">
                      <strong>Calculation:</strong> Income - Expenses<br/>
                      <strong>Positive:</strong> You&rsquo;re saving money<br/>
                      <strong>Negative:</strong> You&rsquo;re spending more than you earn
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className={`font-bold ${netBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrencyDisplay(netBalance)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


