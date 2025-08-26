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
import { useState, useEffect } from "react"
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
  const [formCategory, setFormCategory] = useState<string>("")
  const [formAccount, setFormAccount] = useState<string>("")
  const [formType, setFormType] = useState<string>("")
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([])

  const formatDate = (isoLike: string) => {
    const d = new Date(isoLike)
    return isNaN(d.getTime()) ? isoLike : d.toLocaleDateString()
  }

  const startEdit = (txn: TransactionData) => {
    setEditingId(txn.id)
    setFormDate(txn.date)
    setFormDescription(txn.description || "")
    setFormAmount(String(txn.amount))
    // Try to resolve ids based on loaded dropdown data; fall back to empty
    const matchedCategory = categories.find((c) => c.name === (txn.category || ""))
    const matchedAccount = accounts.find((a) => a.name === (txn.account || ""))
    setFormCategory(matchedCategory?.id || "")
    setFormAccount(matchedAccount?.id || "")
    setFormType(txn.type || "")
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
        category_id: formCategory || null,
        source_id: formAccount || null,
        type: formType || null,
      })
      .eq('id', editingId)
      .select('id, date, description, amount, type, category_id, source_id, categories(name), sources(name)')
      .single()

    setSaving(false)

    if (!error && data) {
      const updated: TransactionData = {
        id: data.id,
        date: data.date,
        description: data.description,
        amount: data.amount,
        category: data.categories?.name || original.category,
        account: data.sources?.name || original.account,
        type: data.type || original.type || "",
      }
      onTransactionUpdated?.(updated)
      setEditingId(null)
    }
  }

  useEffect(() => {
    const fetchDropdownData = async () => {
      const supabase = createClient()
      if (!supabase) return

      const { data: categoriesData } = await supabase.from('categories').select('id, name')
      if (categoriesData) setCategories(categoriesData as any)

      const { data: sourcesData } = await supabase.from('sources').select('id, name')
      if (sourcesData) setAccounts(sourcesData as any)
    }
    fetchDropdownData()
  }, [])

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Account</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((txn) => {
          const isEditing = editingId === txn.id
          return (
            <TableRow key={txn.id} className={isEditing ? 'inline-edit-form' : ''}>
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
              <TableCell>
                {isEditing ? (
                  <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                ) : (
                  txn.category || 'Uncategorized'
                )}
              </TableCell>
              <TableCell>
                {isEditing ? (
                  <select value={formAccount} onChange={(e) => setFormAccount(e.target.value)}>
                    <option value="">Select account</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                ) : (
                  txn.account || 'Unknown Account'
                )}
              </TableCell>
              <TableCell>
                {isEditing ? (
                  <select value={formType} onChange={(e) => setFormType(e.target.value)}>
                    <option value="">Select type</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                ) : (
                  txn.type || ''
                )}
              </TableCell>
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


