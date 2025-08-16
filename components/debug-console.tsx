"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useFinancialData } from "@/hooks/useFinancialData"
import { useAuthState } from "@/hooks/use-auth-state"
import { createClient } from "@/lib/supabase-client"

export function DebugConsole() {
  const { categories, sources, transactions, loading, error } = useFinancialData()
  const { user } = useAuthState()
  const [testResult, setTestResult] = useState<string>("")

  const testDatabaseConnection = async () => {
    try {
      const supabase = createClient()
      if (!supabase) {
        setTestResult("❌ Failed to create Supabase client")
        return
      }

      if (!user?.id) {
        setTestResult("❌ No user ID available")
        return
      }

      // Test basic connection
      const { data, error } = await supabase.from("categories").select("count").limit(1)
      
      if (error) {
        setTestResult(`❌ Database connection failed: ${error.message}`)
      } else {
        setTestResult("✅ Database connection successful")
      }
    } catch (err) {
      setTestResult(`❌ Exception: ${(err as Error).message}`)
    }
  }

  const testUserData = async () => {
    try {
      const supabase = createClient()
      if (!supabase || !user?.id) {
        setTestResult("❌ No Supabase client or user ID")
        return
      }

      // Test user-specific data
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .limit(5)

      if (error) {
        setTestResult(`❌ User data query failed: ${error.message}`)
      } else {
        setTestResult(`✅ User data query successful: ${data?.length || 0} categories found`)
      }
    } catch (err) {
      setTestResult(`❌ Exception: ${(err as Error).message}`)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Debug Console</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Authentication Status</h3>
              <div className="text-sm space-y-1">
                <div>User ID: {user?.id || "Not logged in"}</div>
                <div>Email: {user?.email || "N/A"}</div>
                <div>Status: {user ? "✅ Authenticated" : "❌ Not authenticated"}</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Data Status</h3>
              <div className="text-sm space-y-1">
                <div>Loading: {loading ? "🔄 Yes" : "✅ No"}</div>
                <div>Error: {error || "None"}</div>
                <div>Categories: {categories.length}</div>
                <div>Sources: {sources.length}</div>
                <div>Transactions: {transactions.length}</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Database Tests</h3>
            <div className="flex space-x-2">
              <Button onClick={testDatabaseConnection} size="sm">
                Test Connection
              </Button>
              <Button onClick={testUserData} size="sm">
                Test User Data
              </Button>
            </div>
            {testResult && (
              <div className="text-sm p-2 bg-gray-100 rounded">
                {testResult}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Environment Variables</h3>
            <div className="text-sm space-y-1">
              <div>SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing"}</div>
              <div>SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing"}</div>
              <div>NODE_ENV: {process.env.NODE_ENV}</div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Raw Data (First 3 items)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium">Categories</h4>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(categories.slice(0, 3), null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-medium">Sources</h4>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(sources.slice(0, 3), null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-medium">Transactions</h4>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(transactions.slice(0, 3), null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
