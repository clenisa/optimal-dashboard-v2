"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Edit, PlusCircle } from "lucide-react"

interface Category {
  id: number
  name: string
  color: string
}

interface Transaction {
  id: number
  category_id: number
  amount: number
  type: 'income' | 'expense' | 'transfer'
}

export function CategoryEditor() {
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryColor, setNewCategoryColor] = useState("#4CAF50")
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState("")
  const [editingCategoryColor, setEditingCategoryColor] = useState("")
  const [loading, setLoading] = useState(true)

  const supabase = useMemo(() => createClient(), [])

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase.from("categories").select("*").order("name")
    if (error) {
      console.error("Error fetching categories:", error)
    } else {
      setCategories(data || [])
    }
  }, [supabase])

  const fetchTransactions = useCallback(async () => {
    const { data, error } = await supabase.from("transactions").select("id, category_id, amount, type")
    if (error) {
      console.error("Error fetching transactions:", error)
    } else {
      setTransactions(data || [])
    }
  }, [supabase])

  const fetchData = useCallback(async () => {
    setLoading(true)
    await Promise.all([fetchCategories(), fetchTransactions()])
    setLoading(false)
  }, [fetchCategories, fetchTransactions])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const calculateCategorySubtotal = (categoryId: number): number => {
    return transactions
      .filter(transaction => transaction.category_id === categoryId)
      .reduce((total, transaction) => {
        if (transaction.type === "income") {
          return total + parseFloat(transaction.amount.toString())
        } else {
          return total - parseFloat(transaction.amount.toString())
        }
      }, 0)
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return

    const { data, error } = await supabase
      .from("categories")
      .insert([{ name: newCategoryName.trim(), color: newCategoryColor }])
      .select()

    if (error) {
      console.error("Error adding category:", error)
      alert("Error adding category. Please try again.")
    } else if (data) {
      setCategories([...categories, data[0]])
      setNewCategoryName("")
      setNewCategoryColor("#4CAF50")
    }
  }

  const handleDeleteCategory = async (id: number) => {
    // Check if any transactions are associated with this category
    const categoryTransactions = transactions.filter(t => t.category_id === id)
    
    if (categoryTransactions.length > 0) {
      alert(`Cannot delete category with ${categoryTransactions.length} existing transactions.`)
      return
    }

    if (!confirm("Are you sure you want to delete this category?")) {
      return
    }

    const { error } = await supabase.from("categories").delete().eq("id", id)

    if (error) {
      console.error("Error deleting category:", error)
      alert("Error deleting category. Please try again.")
    } else {
      setCategories(categories.filter((category) => category.id !== id))
    }
  }

  const handleUpdateCategory = async (id: number) => {
    if (!editingCategoryName.trim()) return

    const { data, error } = await supabase
      .from("categories")
      .update({ name: editingCategoryName.trim(), color: editingCategoryColor })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Error updating category:", error)
      alert("Error updating category. Please try again.")
    } else if (data) {
      setCategories(
        categories.map((category) => (category.id === id ? data[0] : category))
      )
      setEditingCategoryId(null)
      setEditingCategoryName("")
      setEditingCategoryColor("")
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            Loading categories...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Editor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <Input
            type="text"
            placeholder="New category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
          />
          <Input
            type="color"
            value={newCategoryColor}
            onChange={(e) => setNewCategoryColor(e.target.value)}
            className="w-16"
          />
          <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add
          </Button>
        </div>
        
        <div className="space-y-2">
          {categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No categories found. Add your first category above.
            </div>
          ) : (
            categories.map((category) => {
              const subtotal = calculateCategorySubtotal(category.id)
              const subtotalClass = subtotal >= 0 ? "text-green-600" : "text-red-600"
              
              return (
                <div key={category.id} className="flex items-center justify-between gap-2 p-3 border rounded-lg">
                  {editingCategoryId === category.id ? (
                    <>
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          type="text"
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleUpdateCategory(category.id)}
                        />
                        <Input
                          type="color"
                          value={editingCategoryColor}
                          onChange={(e) => setEditingCategoryColor(e.target.value)}
                          className="w-16"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => handleUpdateCategory(category.id)}>
                          Save
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingCategoryId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="h-4 w-4 rounded-full border"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium">{category.name}</span>
                        <span className={`text-sm font-mono ${subtotalClass}`}>
                          {formatCurrency(subtotal)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingCategoryId(category.id)
                            setEditingCategoryName(category.name)
                            setEditingCategoryColor(category.color)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

