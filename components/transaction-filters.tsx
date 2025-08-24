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
    <div className="flex items-center space-x-4 mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center space-x-2">
        <Label htmlFor="start-date">From:</Label>
        <Input
          id="start-date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-auto"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Label htmlFor="end-date">To:</Label>
        <Input
          id="end-date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-auto"
        />
      </div>
      <Button onClick={clearFilters} variant="outline">
        Clear Filters
      </Button>
    </div>
  )
}


