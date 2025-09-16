"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Edit, PlusCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PaymentSource {
  id: number
  name: string
  type: "credit" | "debit"
}

export function PaymentSourceEditor() {
  const [paymentSources, setPaymentSources] = useState<PaymentSource[]>([])
  const [newPaymentSourceName, setNewPaymentSourceName] = useState("")
  const [newPaymentSourceType, setNewPaymentSourceType] = useState<"credit" | "debit">("debit")
  const [editingPaymentSourceId, setEditingPaymentSourceId] = useState<number | null>(null)
  const [editingPaymentSourceName, setEditingPaymentSourceName] = useState("")
  const [editingPaymentSourceType, setEditingPaymentSourceType] = useState<"credit" | "debit">("debit")

  const supabase = createClient()

  useEffect(() => {
    fetchPaymentSources()
  }, [])

  const fetchPaymentSources = async () => {
    const { data, error } = await supabase.from("payment_sources").select("*").order("name")
    if (error) {
      console.error("Error fetching payment sources:", error)
    } else {
      setPaymentSources(data || [])
    }
  }

  const handleAddPaymentSource = async () => {
    if (!newPaymentSourceName) return

    const { data, error } = await supabase
      .from("payment_sources")
      .insert([{ name: newPaymentSourceName, type: newPaymentSourceType }])
      .select()

    if (error) {
      console.error("Error adding payment source:", error)
    } else if (data) {
      setPaymentSources([...paymentSources, data[0]])
      setNewPaymentSourceName("")
      setNewPaymentSourceType("debit")
    }
  }

  const handleDeletePaymentSource = async (id: number) => {
    const { error } = await supabase.from("payment_sources").delete().eq("id", id)

    if (error) {
      console.error("Error deleting payment source:", error)
    } else {
      setPaymentSources(paymentSources.filter((source) => source.id !== id))
    }
  }

  const handleUpdatePaymentSource = async (id: number) => {
    if (!editingPaymentSourceName) return

    const { data, error } = await supabase
      .from("payment_sources")
      .update({ name: editingPaymentSourceName, type: editingPaymentSourceType })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Error updating payment source:", error)
    } else if (data) {
      setPaymentSources(
        paymentSources.map((source) => (source.id === id ? data[0] : source))
      )
      setEditingPaymentSourceId(null)
      setEditingPaymentSourceName("")
      setEditingPaymentSourceType("debit")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Source Editor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <Input
            type="text"
            placeholder="New payment source name"
            value={newPaymentSourceName}
            onChange={(e) => setNewPaymentSourceName(e.target.value)}
          />
          <Select onValueChange={(value: 'credit' | 'debit') => setNewPaymentSourceType(value)} defaultValue={newPaymentSourceType}>
            <SelectTrigger>
                <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="debit">Debit</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
            </SelectContent>
        </Select>

          <Button onClick={handleAddPaymentSource}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add
          </Button>
        </div>
        <ul>
          {paymentSources.map((source) => (
            <li key={source.id} className="flex items-center justify-between gap-2 py-2">
              {editingPaymentSourceId === source.id ? (
                <>
                  <Input
                    type="text"
                    value={editingPaymentSourceName}
                    onChange={(e) => setEditingPaymentSourceName(e.target.value)}
                  />
                 <Select onValueChange={(value: 'credit' | 'debit') => setEditingPaymentSourceType(value)} defaultValue={editingPaymentSourceType}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="debit">Debit</SelectItem>
                        <SelectItem value="credit">Credit</SelectItem>
                    </SelectContent>
                </Select>
                  <Button onClick={() => handleUpdatePaymentSource(source.id)}>Save</Button>
                  <Button variant="ghost" onClick={() => setEditingPaymentSourceId(null)}>Cancel</Button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span>{source.name} ({source.type})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingPaymentSourceId(source.id)
                        setEditingPaymentSourceName(source.name)
                        setEditingPaymentSourceType(source.type)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeletePaymentSource(source.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

