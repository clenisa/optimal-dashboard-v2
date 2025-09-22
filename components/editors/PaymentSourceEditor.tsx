"use client"

import { useState, useEffect } from "react"
import type React from "react"
import { createClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Edit, PlusCircle, CreditCard, Wallet } from "lucide-react"
import { useUser } from "@supabase/auth-helpers-react"

interface PaymentSource {
  id: number
  name: string
  type: "credit" | "debit"
  current_balance: number | null
  max_balance: number | null
  interest_rate: number | null
  notes?: string | null
}

export function PaymentSourceEditor() {
  const [paymentSources, setPaymentSources] = useState<PaymentSource[]>([])
  const [loading, setLoading] = useState(true)
  const [editingSource, setEditingSource] = useState<PaymentSource | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "debit" as "credit" | "debit",
    current_balance: "",
    max_balance: "",
    interest_rate: "",
    notes: ""
  })

  const supabase = createClient()
  const user = useUser()

  useEffect(() => {
    if (!user) {
      return
    }

    fetchPaymentSources()
  }, [user])

  const fetchPaymentSources = async () => {
    if (!user) {
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from("sources")
      .select("*")
      .eq("user_id", user.id)
      .order("name")
    if (error) {
      console.error("Error fetching payment sources:", error)
    } else {
      setPaymentSources(data || [])
    }
    setLoading(false)
  }

  const calculateAvailableBalance = (source: PaymentSource): number => {
    const currentBalance = source.current_balance ?? 0
    const maxBalance = source.max_balance ?? 0

    if (source.type === "credit") {
      // For credit cards: available = credit limit - current debt
      return maxBalance - currentBalance
    } else {
      // For debit cards: available = current balance
      return currentBalance
    }
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      type: "debit",
      current_balance: "",
      max_balance: "",
      interest_rate: "",
      notes: ""
    })
    setEditingSource(null)
  }

  const openAddDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEditDialog = (source: PaymentSource) => {
    setFormData({
      name: source.name,
      type: source.type,
      current_balance:
        source.current_balance !== null && source.current_balance !== undefined
          ? source.current_balance.toString()
          : "",
      max_balance:
        source.max_balance !== null && source.max_balance !== undefined
          ? source.max_balance.toString()
          : "",
      interest_rate:
        source.interest_rate !== null && source.interest_rate !== undefined
          ? source.interest_rate.toString()
          : "",
      notes: source.notes || ""
    })
    setEditingSource(source)
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!user) {
      alert("Authentication required. Please log in again.")
      return
    }

    // Validate required fields
    if (!formData.name.trim()) {
      alert("Please enter a source name")
      return
    }

    // Validate numeric fields
    if (formData.current_balance && isNaN(parseFloat(formData.current_balance))) {
      alert("Current balance must be a valid number")
      return
    }

    if (formData.max_balance && isNaN(parseFloat(formData.max_balance))) {
      alert("Maximum balance must be a valid number")
      return
    }

    if (formData.interest_rate && isNaN(parseFloat(formData.interest_rate))) {
      alert("Interest rate must be a valid number")
      return
    }

    // Validate editingSource for updates
    if (editingSource && !editingSource.id) {
      alert("Invalid source selected for editing")
      return
    }

    const sourceData = {
      name: formData.name.trim(),
      type: formData.type,
      current_balance:
        formData.current_balance === "" ? null : parseFloat(formData.current_balance),
      max_balance: formData.max_balance === "" ? null : parseFloat(formData.max_balance),
      interest_rate:
        formData.interest_rate === "" ? null : parseFloat(formData.interest_rate),
      notes: formData.notes.trim() || null,
      user_id: user.id
    }

    if (editingSource && editingSource.id) {
      // Update existing source
      const { data, error } = await supabase
        .from("sources")
        .update(sourceData)
        .eq("id", editingSource.id)
        .eq("user_id", user.id)
        .select()

      if (error) {
        console.error("Error saving source:", error)
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        alert(`Error saving source: ${error.message}`)
        return
      }

      if (!data || data.length === 0) {
        console.error("No data returned from save operation")
        alert("Save operation completed but no data was returned")
        return
      }

      setPaymentSources(
        paymentSources.map((source: PaymentSource) =>
          source.id === editingSource.id ? (data[0] as PaymentSource) : source
        )
      )
      setIsDialogOpen(false)
      resetForm()
    } else {
      // Add new source
      const { data, error } = await supabase
        .from("sources")
        .insert([sourceData])
        .select()

      if (error) {
        console.error("Error saving source:", error)
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        alert(`Error saving source: ${error.message}`)
        return
      }

      if (!data || data.length === 0) {
        console.error("No data returned from save operation")
        alert("Save operation completed but no data was returned")
        return
      }

      setPaymentSources([...paymentSources, data[0] as PaymentSource])
      setIsDialogOpen(false)
      resetForm()
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this payment source?")) {
      return
    }

    const { error } = await supabase.from("sources").delete().eq("id", id)

    if (error) {
      console.error("Error deleting payment source:", error)
      alert("Error deleting payment source. Please try again.")
    } else {
      setPaymentSources(paymentSources.filter((source: PaymentSource) => source.id !== id))
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Source Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            Loading payment sources...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Payment Source Editor
          <Button onClick={openAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Source
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {paymentSources.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payment sources found. Add your first payment source above.
            </div>
          ) : (
            paymentSources.map((source: PaymentSource) => {
              const available = calculateAvailableBalance(source)
              const availableClass = available >= 0 ? "text-green-600" : "text-red-600"
              
              return (
                <div key={source.id} className="flex items-center justify-between gap-2 p-4 border rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    {source.type === 'credit' ? (
                      <CreditCard className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Wallet className="h-5 w-5 text-green-600" />
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium">{source.name}</span>
                      <span className="text-sm text-muted-foreground uppercase">
                        {source.type}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-sm font-mono ${availableClass}`}>
                        Available: {formatCurrency(available)}
                      </span>
                      {source.type === 'credit' && (
                        <span className="text-xs text-muted-foreground">
                          Limit: {formatCurrency(source.max_balance ?? 0)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(source)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(source.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingSource ? "Edit Payment Source" : "Add Payment Source"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Chase Sapphire, Wells Fargo Checking"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: 'credit' | 'debit') => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debit">Debit</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="current_balance">
                  {formData.type === 'credit' ? 'Current Debt' : 'Current Balance'}
                </Label>
                <Input
                  id="current_balance"
                  type="number"
                  step="0.01"
                  value={formData.current_balance}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, current_balance: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="max_balance">
                  {formData.type === 'credit' ? 'Credit Limit' : 'Maximum Balance'}
                </Label>
                <Input
                  id="max_balance"
                  type="number"
                  step="0.01"
                  value={formData.max_balance}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, max_balance: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="interest_rate">Interest Rate (%)</Label>
                <Input
                  id="interest_rate"
                  type="number"
                  step="0.01"
                  value={formData.interest_rate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, interest_rate: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about this payment source..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingSource ? "Update" : "Add"} Source
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

