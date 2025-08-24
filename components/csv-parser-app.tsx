"use client"
import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { processCsvFile, type ParsedTransaction } from "@/lib/csv-parser"
import { createClient } from "@/lib/supabase-client"
import { useAuthState } from "@/hooks/use-auth-state"
import { Upload, FileText, CheckCircle, AlertCircle, Info } from "lucide-react"

// CSV Upload Instructions and Requirements
const CSV_UPLOAD_INSTRUCTIONS = {
  title: "Financial Data CSV Upload",
  description: "Upload your financial transaction data in CSV format to visualize spending patterns and insights.",
  requirements: [
    "File must be in CSV format (.csv)",
    "Required columns: Date, Amount, Description, Category",
    "Date format: YYYY-MM-DD or MM/DD/YYYY",
    "Amount should be numeric (negative for expenses, positive for income)",
    "Maximum file size: 10MB"
  ],
  examples: [
    "Date,Amount,Description,Category",
    "2024-01-15,-45.67,Grocery Store,Food",
    "2024-01-16,2500.00,Salary Deposit,Income"
  ]
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  processedCount: number
  skippedCount: number
}

interface ProcessingStats {
  totalRows: number
  validRows: number
  invalidRows: number
  duplicateRows: number
  processingTime: number
}

export function CsvParserApp() {
  const [file, setFile] = useState<File | null>(null)
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([])
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [processingStats, setProcessingStats] = useState<ProcessingStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const { user } = useAuthState()

  const validateTransaction = (transaction: ParsedTransaction): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    // Type validation - must match database constraint
    const validTypes = ['income', 'expense', 'transfer']
    const transactionType = transaction.type?.toLowerCase().trim()
    
    if (!transactionType || !validTypes.includes(transactionType)) {
      errors.push(`Invalid transaction type: '${transaction.type}'. Must be one of: ${validTypes.join(', ')}`)
    }
    
    // Amount validation
    if (!transaction.amount || isNaN(Number(transaction.amount))) {
      errors.push(`Invalid amount: '${transaction.amount}'. Must be a valid number.`)
    } else if (Number(transaction.amount) === 0) {
      errors.push("Amount cannot be zero")
    }
    
    // Date validation
    if (!transaction.date) {
      errors.push("Date is required")
    } else {
      const date = new Date(transaction.date)
      if (isNaN(date.getTime())) {
        errors.push(`Invalid date format: '${transaction.date}'`)
      } else if (date > new Date()) {
        errors.push(`Future date not allowed: '${transaction.date}'`)
      }
    }
    
    // Description validation
    if (!transaction.description || transaction.description.trim().length === 0) {
      errors.push("Description is required")
    } else if (transaction.description.length > 255) {
      errors.push(`Description too long: ${transaction.description.length} characters (max 255)`)
    }
    
    // Category validation (if provided)
    if (transaction.category && transaction.category.length > 100) {
      errors.push(`Category name too long: ${transaction.category.length} characters (max 100)`)
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  const validateAllTransactions = (transactions: ParsedTransaction[]): ValidationResult => {
    const errors: string[] = []
    const warnings: string[] = []
    let validCount = 0
    let invalidCount = 0
    
    // Check for duplicate transactions
    const duplicates = new Set<string>()
    const seen = new Set<string>()
    
    transactions.forEach((transaction, index) => {
      const key = `${transaction.date}-${transaction.amount}-${transaction.description}`
      if (seen.has(key)) {
        duplicates.add(key)
        warnings.push(`Duplicate transaction at row ${index + 1}: ${transaction.description}`)
      } else {
        seen.add(key)
      }
      
      const validation = validateTransaction(transaction)
      if (validation.isValid) {
        validCount++
      } else {
        invalidCount++
        validation.errors.forEach(error => {
          errors.push(`Row ${index + 1}: ${error}`)
        })
      }
    })
    
    // Add summary warnings
    if (duplicates.size > 0) {
      warnings.push(`Found ${duplicates.size} potential duplicate transactions`)
    }
    
    if (transactions.length === 0) {
      errors.push("No transactions found in CSV file")
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      processedCount: validCount,
      skippedCount: invalidCount
    }
  }

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) {
      setError("No file selected")
      return
    }

    // Reset previous state
    setError(null)
    setSuccess(null)
    setValidationResult(null)
    setProcessingStats(null)
    setTransactions([])
    setDebugInfo([])

    // File type validation
    if (!selectedFile.type.includes('csv') && !selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError("Please select a valid CSV file")
      return
    }

    // File size validation (10MB limit)
    const maxSize = 10 * 1024 * 1024
    if (selectedFile.size > maxSize) {
      setError("File size exceeds 10MB limit. Please select a smaller file.")
      return
    }

    // Log file details for debugging
    const fileInfo = [
      `File selected: ${selectedFile.name}`,
      `Size: ${(selectedFile.size / 1024).toFixed(2)} KB`,
      `Type: ${selectedFile.type}`,
      `Last modified: ${new Date(selectedFile.lastModified).toLocaleString()}`
    ]
    setDebugInfo(fileInfo)
    setFile(selectedFile)
  }, [])

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }, [])

  const handleDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }, [])

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    
    const files = event.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      // Simulate file input change event
      const fakeEvent = {
        target: { files: [file] }
      } as React.ChangeEvent<HTMLInputElement>
      handleFileChange(fakeEvent)
    }
  }, [handleFileChange])

  const handleParse = useCallback(async () => {
    if (!file) {
      setError("Please select a file first")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)
    setUploadProgress(0)
    
    const startTime = Date.now()
    
    try {
      // Add debug information
      setDebugInfo(prev => [...prev, "Starting CSV parsing..."])
      
      // Parse the CSV file
      const parsedTransactions = await processCsvFile(file)
      
      setDebugInfo(prev => [...prev, `Parsed ${parsedTransactions.length} rows from CSV`])
      
      // Validate all transactions
      const validation = validateAllTransactions(parsedTransactions)
      setValidationResult(validation)
      
      // Calculate processing statistics
      const processingTime = Date.now() - startTime
      const stats: ProcessingStats = {
        totalRows: parsedTransactions.length,
        validRows: validation.processedCount,
        invalidRows: validation.skippedCount,
        duplicateRows: validation.warnings.filter(w => w.includes('Duplicate')).length,
        processingTime
      }
      setProcessingStats(stats)
      
      if (validation.isValid) {
        setTransactions(parsedTransactions)
        setSuccess(`Successfully parsed ${validation.processedCount} transactions`)
        setDebugInfo(prev => [...prev, `Validation completed: ${validation.processedCount} valid transactions`])
      } else {
        setError(`Validation failed: ${validation.errors.length} errors found`)
        setDebugInfo(prev => [...prev, `Validation failed with ${validation.errors.length} errors`])
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(`Error parsing CSV file: ${errorMessage}`)
      setDebugInfo(prev => [...prev, `Parsing error: ${errorMessage}`])
    } finally {
      setLoading(false)
    }
  }, [file])

  const handleUploadToSupabase = useCallback(async () => {
    if (transactions.length === 0) {
      setError("No transactions to upload")
      return
    }

    if (!user?.id) {
      setError("You must be logged in to upload transactions")
      return
    }

    if (!validationResult?.isValid) {
      setError("Cannot upload invalid transactions. Please fix validation errors first.")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)
    setUploadProgress(0)

    try {
      const supabase = createClient()
      if (!supabase) {
        throw new Error("Supabase client not available")
      }

      setDebugInfo(prev => [...prev, "Starting upload to Supabase..."])

      // First, get or create categories for the transactions
      const uniqueCategories = [...new Set(transactions.map(txn => txn.category).filter(Boolean))]
      const categoryMap = new Map<string, number>()
      
      for (const categoryName of uniqueCategories) {
        if (categoryName) {
          // Try to find existing category
          const { data: existingCategory } = await supabase
            .from("categories")
            .select("id")
            .eq("user_id", user.id)
            .eq("name", categoryName)
            .single()
          
          if (existingCategory) {
            categoryMap.set(categoryName, existingCategory.id)
          } else {
            // Create new category if it doesn't exist
            const { data: newCategory, error: createError } = await supabase
              .from("categories")
              .insert({
                user_id: user.id,
                name: categoryName,
                color: `#${Math.floor(Math.random()*16777215).toString(16)}` // Random color
              })
              .select("id")
              .single()
            
            if (createError) {
              throw new Error(`Failed to create category '${categoryName}': ${createError.message}`)
            }
            
            categoryMap.set(categoryName, newCategory.id)
          }
        }
      }

      // Prepare transactions for upload - match the actual database schema
      const transactionsToUpload = transactions.map(txn => ({
        user_id: user.id,
        date: txn.date,
        description: txn.description,
        amount: parseFloat(txn.amount.toString()),
        type: txn.type,
        category_id: txn.category ? categoryMap.get(txn.category) : null,
        mode: 'actual' // Default mode for CSV imports
      }))

      // Upload in batches to avoid timeout
      const batchSize = 50
      const batches = []
      for (let i = 0; i < transactionsToUpload.length; i += batchSize) {
        batches.push(transactionsToUpload.slice(i, i + batchSize))
      }

      let uploadedCount = 0
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i]
        
        const { data, error: uploadError } = await supabase
          .from("transactions")
          .insert(batch)

        if (uploadError) {
          throw new Error(`Upload error in batch ${i + 1}: ${uploadError.message}`)
        }

        uploadedCount += batch.length
        const progress = Math.round((uploadedCount / transactionsToUpload.length) * 100)
        setUploadProgress(progress)
        
        setDebugInfo(prev => [...prev, `Uploaded batch ${i + 1}/${batches.length} (${batch.length} transactions)`])
      }

      setSuccess(`Successfully uploaded ${uploadedCount} transactions to Supabase`)
      setDebugInfo(prev => [...prev, `Upload completed: ${uploadedCount} transactions`])
      
      // Reset form after successful upload
      setTransactions([])
      setFile(null)
      setValidationResult(null)
      setProcessingStats(null)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(`Error uploading to Supabase: ${errorMessage}`)
      setDebugInfo(prev => [...prev, `Upload error: ${errorMessage}`])
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }, [transactions, user?.id, validationResult])

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
      {/* Instructions and Requirements Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {CSV_UPLOAD_INSTRUCTIONS.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            {CSV_UPLOAD_INSTRUCTIONS.description}
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Requirements */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Requirements
              </h4>
              <ul className="space-y-2 text-sm">
                {CSV_UPLOAD_INSTRUCTIONS.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Example Format */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" />
                Example Format
              </h4>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm font-mono">
                {CSV_UPLOAD_INSTRUCTIONS.examples.map((line, index) => (
                  <div key={index} className="text-gray-700 dark:text-gray-300">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CSV Transaction Parser</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* File Upload Section */}
          <div className="space-y-2">
            <Label htmlFor="csv-file">Select CSV File</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                loading 
                  ? 'border-gray-300 bg-gray-50 dark:bg-gray-800' 
                  : file
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }`}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={loading}
                className="hidden"
              />
              <Label htmlFor="csv-file" className="cursor-pointer">
                {file ? (
                  <div className="space-y-3">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                    <div className="text-lg font-medium text-green-800 dark:text-green-200">{file.name}</div>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      {(file.size / 1024).toFixed(2)} KB
                    </div>
                    <div className="text-xs text-green-500">File selected successfully!</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div className="text-lg font-medium">Click to select or drag and drop a CSV file</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Supports .csv files up to 10MB
                    </div>
                    <div className="text-xs text-gray-400">
                      Drag your file here or click to browse
                    </div>
                  </div>
                )}
              </Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button 
              onClick={handleParse} 
              disabled={!file || loading}
              className="flex-1"
            >
              {loading ? "Parsing..." : "Parse CSV"}
            </Button>
            
            {transactions.length > 0 && validationResult?.isValid && (
              <Button 
                onClick={handleUploadToSupabase} 
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                {loading ? "Uploading..." : "Upload to Supabase"}
              </Button>
            )}
          </div>

          {/* Progress Indicator */}
          {loading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Upload Progress</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Status Messages */}
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

          {/* Validation Results */}
          {validationResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Validation Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Summary Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {validationResult.processedCount}
                    </div>
                    <div className="text-sm text-gray-500">Valid</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {validationResult.skippedCount}
                    </div>
                    <div className="text-sm text-gray-500">Invalid</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {validationResult.warnings.length}
                    </div>
                    <div className="text-sm text-gray-500">Warnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {processingStats?.processingTime || 0}ms
                    </div>
                    <div className="text-sm text-gray-500">Processing Time</div>
                  </div>
                </div>

                {/* Validation Status */}
                <div className="flex items-center space-x-2">
                  <Badge variant={validationResult.isValid ? "default" : "destructive"}>
                    {validationResult.isValid ? "Valid" : "Invalid"}
                  </Badge>
                  {validationResult.warnings.length > 0 && (
                    <Badge variant="secondary">
                      {validationResult.warnings.length} Warning(s)
                    </Badge>
                  )}
                </div>

                {/* Error Messages */}
                {validationResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-red-600">Validation Errors:</h4>
                    <ScrollArea className="h-32 w-full border rounded p-2">
                      <div className="space-y-1">
                        {validationResult.errors.map((error, index) => (
                          <div key={index} className="text-sm text-red-600">
                            {error}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {/* Warning Messages */}
                {validationResult.warnings.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-yellow-600">Warnings:</h4>
                    <ScrollArea className="h-24 w-full border rounded p-2">
                      <div className="space-y-1">
                        {validationResult.warnings.map((warning, index) => (
                          <div key={index} className="text-sm text-yellow-600">
                            {warning}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Transaction Preview */}
          {transactions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Parsed Transactions ({transactions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64 w-full">
                  <div className="space-y-2">
                    {transactions.slice(0, 10).map((txn, index) => (
                      <div key={index} className="border rounded p-2 text-sm">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <div>
                            <span className="font-medium">Date:</span> {txn.date}
                          </div>
                          <div>
                            <span className="font-medium">Amount:</span> ${txn.amount}
                          </div>
                          <div>
                            <span className="font-medium">Type:</span> {txn.type || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Category:</span> {txn.category || 'N/A'}
                          </div>
                        </div>
                        <div className="mt-1">
                          <span className="font-medium">Description:</span> {txn.description}
                        </div>
                      </div>
                    ))}
                    {transactions.length > 10 && (
                      <div className="text-center text-sm text-gray-500 py-2">
                        Showing first 10 of {transactions.length} transactions
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Debug Information */}
          {debugInfo.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Debug Information</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-32 w-full">
                  <div className="space-y-1">
                    {debugInfo.map((info, index) => (
                      <div key={index} className="text-xs font-mono text-gray-600">
                        {info}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

        </CardContent>
      </Card>
    </div>
  )
}
