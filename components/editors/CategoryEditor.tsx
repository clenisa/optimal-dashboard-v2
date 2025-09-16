"use client"

import { useState, useEffect } from "react"
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

export function CategoryEditor() {
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryColor, setNewCategoryColor] = useState("#000000")
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState("")
  const [editingCategoryColor, setEditingCategoryColor] = useState("")

  const supabase = createClient()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*").order("name")
    if (error) {
      console.error("Error fetching categories:", error)
    } else {
      setCategories(data || [])
    }
  }

  const handleAddCategory = async () => {
    if (!newCategoryName) return

    const { data, error } = await supabase
      .from("categories")
      .insert([{ name: newCategoryName, color: newCategoryColor }])
      .select()

    if (error) {
      console.error("Error adding category:", error)
    } else if (data) {
      setCategories([...categories, data[0]])
      setNewCategoryName("")
      setNewCategoryColor("#000000")
    }
  }

  const handleDeleteCategory = async (id: number) => {
    // First, check if any transactions are associated with this category
    const { data: transactions, error: transactionsError } = await supabase
      .from("transactions")
      .select("id")
      .eq("category_id", id)
      .limit(1)

    if (transactionsError) {
      console.error("Error checking transactions:", transactionsError)
      return
    }

    if (transactions && transactions.length > 0) {
      alert("Cannot delete category with existing transactions.")
      return
    }

    const { error } = await supabase.from("categories").delete().eq("id", id)

    if (error) {
      console.error("Error deleting category:", error)
    } else {
      setCategories(categories.filter((category) => category.id !== id))
    }
  }

  const handleUpdateCategory = async (id: number) => {
    if (!editingCategoryName) return

    const { data, error } = await supabase
      .from("categories")
      .update({ name: editingCategoryName, color: editingCategoryColor })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Error updating category:", error)
    } else if (data) {
      setCategories(
        categories.map((category) => (category.id === id ? data[0] : category))
      )
      setEditingCategoryId(null)
      setEditingCategoryName("")
      setEditingCategoryColor("")
    }
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
          />
          <Input
            type="color"
            value={newCategoryColor}
            onChange={(e) => setNewCategoryColor(e.target.value)}
          />
          <Button onClick={handleAddCategory}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add
          </Button>
        </div>
        <ul>
          {categories.map((category) => (
            <li key={category.id} className="flex items-center justify-between gap-2 py-2">
              {editingCategoryId === category.id ? (
                <>
                  <Input
                    type="text"
                    value={editingCategoryName}
                    onChange={(e) => setEditingCategoryName(e.target.value)}
                  />
                  <Input
                    type="color"
                    value={editingCategoryColor}
                    onChange={(e) => setEditingCategoryColor(e.target.value)}
                  />
                  <Button onClick={() => handleUpdateCategory(category.id)}>Save</Button>
                  <Button variant="ghost" onClick={() => setEditingCategoryId(null)}>Cancel</Button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span>{category.name}</span>
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
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

