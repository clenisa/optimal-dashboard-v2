"use client"

import { useState, useEffect } from 'react'
import { TransactionData } from "@/lib/chart-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TransactionFiltersProps {
  allTransactions: TransactionData[]
  setFilteredTransactions: (transactions: TransactionData[]) => void
}

export function TransactionFilters({ allTransactions, setFilteredTransactions }: TransactionFiltersProps) {
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const filtered = allTransactions.filter(t => {
        const transactionDate = new Date(t.date)
        return transactionDate >= start && transactionDate <= end
      })
      setFilteredTransactions(filtered)
    } else {
      setFilteredTransactions(allTransactions)
    }
  }, [startDate, endDate, allTransactions, setFilteredTransactions])

  const clearFilters = () => {
    setStartDate('')
    setEndDate('')
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Label htmlFor="start-date" className="text-xs font-medium uppercase text-muted-foreground">
          From
        </Label>
        <Input
          id="start-date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-[150px]"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Label htmlFor="end-date" className="text-xs font-medium uppercase text-muted-foreground">
          To
        </Label>
        <Input
          id="end-date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-[150px]"
        />
      </div>
      <Button onClick={clearFilters} variant="outline" size="sm">
        Clear Filters
      </Button>
    </div>
  )
}


