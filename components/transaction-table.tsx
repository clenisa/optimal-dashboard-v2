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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { createClient } from "@/lib/supabase-client"

interface TransactionTableProps {
  transactions: TransactionData[]
  onTransactionUpdated?: (txn: TransactionData) => void
}

export function TransactionTable({ transactions, onTransactionUpdated }: TransactionTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formDate, setFormDate] = useState<string>("")
  const [formDescription, setFormDescription] = useState<string>("")
  const [formAmount, setFormAmount] = useState<string>("")
  const [saving, setSaving] = useState<boolean>(false)

  const formatDate = (isoLike: string) => {
    const d = new Date(isoLike)
    return isNaN(d.getTime()) ? isoLike : d.toLocaleDateString()
  }

  const startEdit = (txn: TransactionData) => {
    setEditingId(txn.id)
    setFormDate(txn.date)
    setFormDescription(txn.description || "")
    setFormAmount(String(txn.amount))
  }

  const cancelEdit = () => {
    setEditingId(null)
    setSaving(false)
  }

  const handleSave = async (original: TransactionData) => {
    if (!editingId) return
    const supabase = createClient()
    if (!supabase) return

    const nextAmount = parseFloat(formAmount)
    if (Number.isNaN(nextAmount)) return

    setSaving(true)
    const { data, error } = await supabase
      .from('transactions')
      .update({
        date: formDate,
        description: formDescription,
        amount: nextAmount,
      })
      .eq('id', editingId)
      .select('id, date, description, amount')
      .single()

    setSaving(false)

    if (!error && data) {
      const updated: TransactionData = {
        id: data.id,
        date: data.date,
        description: data.description,
        amount: data.amount,
        category: original.category,
        account: original.account,
        type: original.type,
      }
      onTransactionUpdated?.(updated)
      setEditingId(null)
    }
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
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((txn) => {
          const isEditing = editingId === txn.id
          return (
            <TableRow key={txn.id}>
              <TableCell>
                {isEditing ? (
                  <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
                ) : (
                  formatDate(txn.date)
                )}
              </TableCell>
              <TableCell>
                {isEditing ? (
                  <Input value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
                ) : (
                  txn.description || ""
                )}
              </TableCell>
              <TableCell>{txn.category || "Uncategorized"}</TableCell>
              <TableCell>{txn.account || "Unknown Account"}</TableCell>
              <TableCell className={`text-right ${txn.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                {isEditing ? (
                  <Input type="number" step="0.01" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} className="text-right" />
                ) : (
                  txn.amount.toFixed(2)
                )}
              </TableCell>
              <TableCell className="text-right space-x-2">
                {isEditing ? (
                  <>
                    <Button size="sm" onClick={() => handleSave(txn)} disabled={saving}>Save</Button>
                    <Button size="sm" variant="secondary" onClick={cancelEdit} disabled={saving}>Cancel</Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => startEdit(txn)}>Edit</Button>
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}


