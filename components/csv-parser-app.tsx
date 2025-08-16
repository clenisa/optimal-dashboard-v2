"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { processCsvFile, type ParsedTransaction } from "@/lib/csv-parser"
import { createClient } from "@/lib/supabase-client"
import { useAuthState } from "@/hooks/use-auth-state"

export function CsvParserApp() {
  const [file, setFile] = useState<File | null>(null)
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { user } = useAuthState()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile)
      setError(null)
    } else {
      setError("Please select a valid CSV file")
      setFile(null)
    }
  }

  const handleParse = async () => {
    if (!file) {
      setError("Please select a file first")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const parsedTransactions = await processCsvFile(file)
      setTransactions(parsedTransactions)
      setSuccess(`Successfully parsed ${parsedTransactions.length} transactions`)
    } catch (err) {
      setError("Error parsing CSV file: " + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadToSupabase = async () => {
    if (transactions.length === 0) {
      setError("No transactions to upload")
      return
    }

    if (!user?.id) {
      setError("You must be logged in to upload transactions")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      console.log('[DEBUG] CSV Parser: Starting upload for user', user.id)
      const supabase = createClient()
      if (!supabase) {
        throw new Error("Supabase client not available")
      }

      const { data, error: uploadError } = await supabase.from("transactions").insert(
        transactions.map((txn) => ({
          user_id: user.id, // Add user context
          date: txn.date,
          description: txn.description,
          amount: txn.amount,
          category: txn.category,
          account: txn.account,
        })),
      )

      if (uploadError) {
        console.error('[ERROR] CSV Parser: Upload error:', uploadError)
        throw uploadError
      }

      console.log('[DEBUG] CSV Parser: Successfully uploaded', transactions.length, 'transactions')
      setSuccess(`Successfully uploaded ${transactions.length} transactions to Supabase`)
      setTransactions([])
      setFile(null)
    } catch (err) {
      setError("Error uploading to Supabase: " + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>Please log in to use the CSV Parser</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CSV Transaction Parser</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-file">Select CSV File</Label>
            <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} disabled={loading} />
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleParse} disabled={!file || loading}>
              {loading ? "Parsing..." : "Parse CSV"}
            </Button>

            {transactions.length > 0 && (
              <Button onClick={handleUploadToSupabase} disabled={loading} variant="outline">
                Upload to Supabase
              </Button>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Parsed Transactions ({transactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Description</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Category</th>
                    <th className="text-left p-2">Account</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 10).map((txn, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{txn.date}</td>
                      <td className="p-2">{txn.description}</td>
                      <td className="p-2">${txn.amount.toFixed(2)}</td>
                      <td className="p-2">{txn.category}</td>
                      <td className="p-2">{txn.account}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transactions.length > 10 && (
                <p className="text-xs text-gray-500 mt-2">Showing first 10 of {transactions.length} transactions</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
