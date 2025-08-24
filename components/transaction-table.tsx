"use client"

import { TransactionData } from "@/lib/chart-data"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface TransactionTableProps {
  transactions: TransactionData[]
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  const formatDate = (isoLike: string) => {
    const d = new Date(isoLike)
    return isNaN(d.getTime()) ? isoLike : d.toLocaleDateString()
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Account</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((txn) => (
          <TableRow key={txn.id}>
            <TableCell>{formatDate(txn.date)}</TableCell>
            <TableCell>{txn.description || ""}</TableCell>
            <TableCell>{txn.category || "Uncategorized"}</TableCell>
            <TableCell>{txn.account || "Unknown Account"}</TableCell>
            <TableCell className={`text-right ${txn.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
              {txn.amount.toFixed(2)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}


