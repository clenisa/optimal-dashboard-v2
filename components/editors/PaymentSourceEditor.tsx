"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Edit, PlusCircle, CreditCard, Wallet } from "lucide-react"

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
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchPaymentSources()
  }, [])

  const fetchPaymentSources = async () => {
    setLoading(true)
    const { data, error } = await supabase.from("sources").select("*").order("name")
    if (error) {
      console.error("Error fetching payment sources:", error)
    } else {
      setPaymentSources(data || [])
    }
    setLoading(false)
  }

  const handleAddPaymentSource = async () => {
    if (!newPaymentSourceName.trim()) return

    const { data, error } = await supabase
      .from("sources")
      .insert([{ name: newPaymentSourceName.trim(), type: newPaymentSourceType }])
      .select()

    if (error) {
      console.error("Error adding payment source:", error)
      alert("Error adding payment source. Please try again.")
    } else if (data) {
      setPaymentSources([...paymentSources, data[0]])
      setNewPaymentSourceName("")
      setNewPaymentSourceType("debit")
    }
  }

  const handleDeletePaymentSource = async (id: number) => {
    if (!confirm("Are you sure you want to delete this payment source?")) {
      return
    }

    const { error } = await supabase.from("sources").delete().eq("id", id)

    if (error) {
      console.error("Error deleting payment source:", error)
      alert("Error deleting payment source. Please try again.")
    } else {
      setPaymentSources(paymentSources.filter((source) => source.id !== id))
    }
  }

  const handleUpdatePaymentSource = async (id: number) => {
    if (!editingPaymentSourceName.trim()) return

    const { data, error } = await supabase
      .from("sources")
      .update({ name: editingPaymentSourceName.trim(), type: editingPaymentSourceType })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Error updating payment source:", error)
      alert("Error updating payment source. Please try again.")
    } else if (data) {
      setPaymentSources(
        paymentSources.map((source) => (source.id === id ? data[0] : source))
      )
      setEditingPaymentSourceId(null)
      setEditingPaymentSourceName("")
      setEditingPaymentSourceType("debit")
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
        <CardTitle>Payment Source Editor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <Input
            type="text"
            placeholder="New payment source name"
            value={newPaymentSourceName}
            onChange={(e) => setNewPaymentSourceName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddPaymentSource()}
          />
          <Select 
            value={newPaymentSourceType} 
            onValueChange={(value: 'credit' | 'debit') => setNewPaymentSourceType(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="debit">Debit</SelectItem>
              <SelectItem value="credit">Credit</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddPaymentSource} disabled={!newPaymentSourceName.trim()}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add
          </Button>
        </div>
        
        <div className="space-y-2">
          {paymentSources.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payment sources found. Add your first payment source above.
            </div>
          ) : (
            paymentSources.map((source) => (
              <div key={source.id} className="flex items-center justify-between gap-2 p-3 border rounded-lg">
                {editingPaymentSourceId === source.id ? (
                  <>
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="text"
                        value={editingPaymentSourceName}
                        onChange={(e) => setEditingPaymentSourceName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleUpdatePaymentSource(source.id)}
                      />
                      <Select 
                        value={editingPaymentSourceType} 
                        onValueChange={(value: 'credit' | 'debit') => setEditingPaymentSourceType(value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="debit">Debit</SelectItem>
                          <SelectItem value="credit">Credit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => handleUpdatePaymentSource(source.id)}>
                        Save
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditingPaymentSourceId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 flex-1">
                      {source.type === 'credit' ? (
                        <CreditCard className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Wallet className="h-4 w-4 text-green-600" />
                      )}
                      <span className="font-medium">{source.name}</span>
                      <span className="text-sm text-muted-foreground capitalize">
                        ({source.type})
                      </span>
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
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

