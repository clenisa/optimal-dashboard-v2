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
import { ScrollArea } from "@/components/ui/scroll-area"
import { processCsvFile, type ParsedTransaction } from "@/lib/csv-parser"
import { Upload, FileText, CheckCircle, AlertCircle, Download, X, Combine } from "lucide-react"

interface CsvFile {
  id: string
  file: File
  transactions: ParsedTransaction[]
  status: "pending" | "processing" | "processed" | "error"
  error?: string
}

interface CombinedResult {
  transactions: ParsedTransaction[]
  summary: {
    totalFiles: number
    totalTransactions: number
    duplicatesRemoved: number
    processingTime: number
  }
}

export function CsvCombinerApp() {
  const [csvFiles, setCsvFiles] = useState<CsvFile[]>([])
  const [combinedResult, setCombinedResult] = useState<CombinedResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const generateFileId = () => `csv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const validateCsvFile = (file: File): string | null => {
    // File type validation
    if (!file.type.includes("csv") && !file.name.toLowerCase().endsWith(".csv")) {
      return "Invalid file format. Only CSV files are allowed."
    }

    // File size validation (10MB limit per file)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return "File too large. Maximum size is 10MB per file."
    }

    return null
  }

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])

    if (selectedFiles.length === 0) {
      setError("No files selected")
      return
    }

    // Check if adding these files would exceed the limit
    if (csvFiles.length + selectedFiles.length > 5) {
      setError(`Cannot add ${selectedFiles.length} files. Maximum is 5 files total. Currently have ${csvFiles.length} files.`)
      return
    }

    // Reset previous state
    setError(null)
    setSuccess(null)
    setCombinedResult(null)

    // Validate and add files
    const newFiles: CsvFile[] = []
    for (const file of selectedFiles) {
      const validationError = validateCsvFile(file)
      if (validationError) {
        setError(`${file.name}: ${validationError}`)
        return
      }

      newFiles.push({
        id: generateFileId(),
        file,
        transactions: [],
        status: "pending",
      })
    }

    setCsvFiles((prev) => [...prev, ...newFiles])
  }, [csvFiles.length])

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

    const files = Array.from(event.dataTransfer.files)
    if (files.length > 0) {
      // Simulate file input change event
      const fakeEvent = {
        target: { files },
      } as unknown as React.ChangeEvent<HTMLInputElement>
      handleFileChange(fakeEvent)
    }
  }, [handleFileChange])

  const removeFile = useCallback((fileId: string) => {
    setCsvFiles((prev) => prev.filter((f) => f.id !== fileId))
    setCombinedResult(null)
    setError(null)
    setSuccess(null)
  }, [])

  const clearAllFiles = useCallback(() => {
    setCsvFiles([])
    setCombinedResult(null)
    setError(null)
    setSuccess(null)
  }, [])

  const processFiles = useCallback(async () => {
    if (csvFiles.length === 0) {
      setError("No files to process")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)
    setProgress(0)

    const startTime = Date.now()

    try {
      const processedFiles: CsvFile[] = []

      // Process each file
      for (let i = 0; i < csvFiles.length; i++) {
        const csvFile = csvFiles[i]

        // Update status to processing
        setCsvFiles((prev) => prev.map((f) =>
          f.id === csvFile.id ? { ...f, status: "processing" } : f
        ))

        try {
          const transactions = await processCsvFile(csvFile.file)

          const processedFile: CsvFile = {
            ...csvFile,
            transactions,
            status: "processed",
          }

          processedFiles.push(processedFile)

          // Update the file in state
          setCsvFiles((prev) => prev.map((f) =>
            f.id === csvFile.id ? processedFile : f
          ))

        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Unknown error"
          const errorFile: CsvFile = {
            ...csvFile,
            status: "error",
            error: errorMessage,
          }

          processedFiles.push(errorFile)

          // Update the file in state
          setCsvFiles((prev) => prev.map((f) =>
            f.id === csvFile.id ? errorFile : f
          ))
        }

        // Update progress
        const progressPercent = Math.round(((i + 1) / csvFiles.length) * 50) // First 50% for processing
        setProgress(progressPercent)
      }

      // Combine all successful transactions
      const allTransactions: ParsedTransaction[] = []
      const successfulFiles = processedFiles.filter((f) => f.status === "processed")

      if (successfulFiles.length === 0) {
        throw new Error("No files were processed successfully")
      }

      successfulFiles.forEach((file) => {
        allTransactions.push(...file.transactions)
      })

      setProgress(75) // 75% for combining

      // Remove duplicates based on date, amount, and description
      const uniqueTransactions: ParsedTransaction[] = []
      const seen = new Set<string>()
      let duplicatesCount = 0

      for (const transaction of allTransactions) {
        const key = `${transaction.date}-${transaction.amount}-${transaction.description.trim().toLowerCase()}`
        if (!seen.has(key)) {
          seen.add(key)
          uniqueTransactions.push(transaction)
        } else {
          duplicatesCount++
        }
      }

      // Sort by date (newest first)
      uniqueTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      const processingTime = Date.now() - startTime

      const result: CombinedResult = {
        transactions: uniqueTransactions,
        summary: {
          totalFiles: successfulFiles.length,
          totalTransactions: uniqueTransactions.length,
          duplicatesRemoved: duplicatesCount,
          processingTime,
        },
      }

      setCombinedResult(result)
      setProgress(100)
      setSuccess(`Successfully combined ${result.summary.totalFiles} CSV files into ${result.summary.totalTransactions} unique transactions`)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      setError(`Error processing files: ${errorMessage}`)
    } finally {
      setLoading(false)
      setTimeout(() => setProgress(0), 2000) // Reset progress after 2 seconds
    }
  }, [csvFiles])

  const downloadCombinedCsv = useCallback(() => {
    if (!combinedResult) return

    // Create CSV content
    const headers = ["date", "description", "amount", "type", "category"]
    const csvContent = [
      headers.join(","),
      ...combinedResult.transactions.map((txn) => {
        const sanitizedDescription = txn.description.replace(/"/g, '""')
        return [
          txn.date,
          `"${sanitizedDescription}"`,
          txn.amount,
          txn.type,
          txn.category || "",
        ].join(",")
      }),
    ].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `combined-transactions-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [combinedResult])

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Combine className="h-5 w-5" />
            CSV Combiner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-300">
            Combine up to 5 CSV files into a single file. Duplicate transactions will be automatically removed based on date, amount, description, type, category.
          </p>
        </CardContent>
      </Card>

      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload CSV Files ({csvFiles.length}/5)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drag and Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
              loading
                ? "border-gray-300 bg-gray-50 dark:bg-gray-800"
                : csvFiles.length >= 5
                  ? "border-gray-300 bg-gray-100 dark:bg-gray-800 opacity-50"
                  : "border-gray-300 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            }`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Input
              id="csv-files"
              type="file"
              accept=".csv"
              multiple
              onChange={handleFileChange}
              disabled={loading || csvFiles.length >= 5}
              className="hidden"
            />
            <Label htmlFor="csv-files" className={csvFiles.length >= 5 ? "cursor-not-allowed" : "cursor-pointer"}>
              <div className="space-y-3">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div className="text-lg font-medium">
                  {csvFiles.length >= 5
                    ? "Maximum 5 files reached"
                    : "Click to select or drag and drop CSV files"
                  }
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {csvFiles.length >= 5
                    ? "Remove some files to add more"
                    : `Supports .csv files up to 10MB each (${csvFiles.length}/5 files selected)`
                  }
                </div>
              </div>
            </Label>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              onClick={processFiles}
              disabled={csvFiles.length === 0 || loading}
              className="flex-1"
            >
              {loading ? "Processing..." : `Combine ${csvFiles.length} Files`}
            </Button>

            {csvFiles.length > 0 && (
              <Button
                onClick={clearAllFiles}
                disabled={loading}
                variant="outline"
              >
                Clear All
              </Button>
            )}

            {combinedResult && (
              <Button
                onClick={downloadCombinedCsv}
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            )}
          </div>

          {/* Progress Indicator */}
          {loading && progress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Status Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* File List */}
      {csvFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {csvFiles.map((csvFile) => (
                <div key={csvFile.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">{csvFile.file.name}</div>
                      <div className="text-sm text-gray-500">
                        {(csvFile.file.size / 1024).toFixed(2)} KB
                        {csvFile.transactions.length > 0 && ` • ${csvFile.transactions.length} transactions`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      csvFile.status === "processed" ? "default" :
                      csvFile.status === "processing" ? "secondary" :
                      csvFile.status === "error" ? "destructive" : "outline"
                    }>
                      {csvFile.status}
                    </Badge>
                    <Button
                      onClick={() => removeFile(csvFile.id)}
                      disabled={loading}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Combined Results */}
      {combinedResult && (
        <Card>
          <CardHeader>
            <CardTitle>Combined Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {combinedResult.summary.totalFiles}
                </div>
                <div className="text-sm text-gray-500">Files Combined</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {combinedResult.summary.totalTransactions}
                </div>
                <div className="text-sm text-gray-500">Total Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {combinedResult.summary.duplicatesRemoved}
                </div>
                <div className="text-sm text-gray-500">Duplicates Removed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {combinedResult.summary.processingTime}ms
                </div>
                <div className="text-sm text-gray-500">Processing Time</div>
              </div>
            </div>

            {/* Transaction Preview */}
            <div className="space-y-2">
              <h4 className="font-medium">Transaction Preview (First 10)</h4>
              <ScrollArea className="h-64 w-full border rounded p-2">
                <div className="space-y-2">
                  {combinedResult.transactions.slice(0, 10).map((txn, index) => (
                    <div key={index} className="border rounded p-2 text-sm">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div>
                          <span className="font-medium">Date:</span> {txn.date}
                        </div>
                        <div>
                          <span className="font-medium">Amount:</span> ${txn.amount}
                        </div>
                        <div>
                          <span className="font-medium">Type:</span> {txn.type || "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">Category:</span> {txn.category || "N/A"}
                        </div>
                      </div>
                      <div className="mt-1">
                        <span className="font-medium">Description:</span> {txn.description}
                      </div>
                    </div>
                  ))}
                  {combinedResult.transactions.length > 10 && (
                    <div className="text-center text-sm text-gray-500 py-2">
                      Showing first 10 of {combinedResult.transactions.length} transactions
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
