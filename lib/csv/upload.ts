import { createClient } from '@/lib/supabase-client'
import type { ParsedTransaction } from '@/lib/csv-parser'

interface UploadTransactionsArgs {
  userId: string
  transactions: ParsedTransaction[]
  onProgress?: (progress: number, batchIndex: number, batchSize: number) => void
}

export async function uploadTransactionsToSupabase({
  userId,
  transactions,
  onProgress,
}: UploadTransactionsArgs): Promise<number> {
  const supabase = createClient()
  if (!supabase) {
    throw new Error('Supabase client not available')
  }

  const uniqueCategories = [...new Set(transactions.map((txn) => txn.category).filter(Boolean))]
  const categoryMap = new Map<string, number>()

  for (const categoryName of uniqueCategories) {
    if (!categoryName) continue

    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', userId)
      .eq('name', categoryName)
      .single()

    if (existingCategory) {
      categoryMap.set(categoryName, existingCategory.id)
      continue
    }

    const { data: newCategory, error: createError } = await supabase
      .from('categories')
      .insert({
        user_id: userId,
        name: categoryName,
        color: `#${Math.floor(Math.random() * 16_777_215).toString(16)}`,
      })
      .select('id')
      .single()

    if (createError) {
      throw new Error(`Failed to create category '${categoryName}': ${createError.message}`)
    }

    categoryMap.set(categoryName, newCategory.id)
  }

  const transactionsToUpload = transactions.map((txn) => ({
    user_id: userId,
    date: txn.date,
    description: txn.description,
    amount: parseFloat(txn.amount.toString()),
    type: txn.type,
    category_id: txn.category ? categoryMap.get(txn.category) : null,
    mode: 'actual',
  }))

  const batchSize = 50
  const batches: typeof transactionsToUpload[] = []
  for (let i = 0; i < transactionsToUpload.length; i += batchSize) {
    batches.push(transactionsToUpload.slice(i, i + batchSize))
  }

  let uploadedCount = 0
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    const { error: uploadError } = await supabase.from('transactions').insert(batch)

    if (uploadError) {
      throw new Error(`Upload error in batch ${i + 1}: ${uploadError.message}`)
    }

    uploadedCount += batch.length
    const progress = Math.round((uploadedCount / transactionsToUpload.length) * 100)
    onProgress?.(progress, i + 1, batches.length)
  }

  return uploadedCount
}

export async function deleteAllTransactions(userId: string): Promise<void> {
  const supabase = createClient()
  if (!supabase) {
    throw new Error('Supabase client not available')
  }

  const { error } = await supabase.from('transactions').delete().eq('user_id', userId)
  if (error) {
    throw new Error('Failed to delete transactions')
  }
}
