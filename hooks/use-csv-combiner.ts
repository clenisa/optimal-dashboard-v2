"use client"

import { useCallback, useMemo, useState } from 'react'
import { processCsvFile } from '@/lib/csv-parser'
import { validateCsvFile } from '@/lib/csv-utils'
import { combineTransactions } from '@/lib/csv/combiner'
import type { CombinedResult, CsvFileItem } from '@/lib/csv/types'

interface UseCsvCombinerResult {
  files: CsvFileItem[]
  combinedResult: CombinedResult | null
  loading: boolean
  progress: number
  error: string | null
  success: string | null
  addFiles: (files: File[]) => void
  removeFile: (id: string) => void
  clearFiles: () => void
  processFiles: () => Promise<void>
  downloadCombinedCsv: () => void
}

const FILE_LIMIT = 5

export function useCsvCombiner(): UseCsvCombinerResult {
  const [files, setFiles] = useState<CsvFileItem[]>([])
  const [combinedResult, setCombinedResult] = useState<CombinedResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const addFiles = useCallback((selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return

    if (files.length + selectedFiles.length > FILE_LIMIT) {
      setError(`Cannot add ${selectedFiles.length} files. Maximum is ${FILE_LIMIT} files total.`)
      return
    }

    const newEntries: CsvFileItem[] = []
    for (const file of selectedFiles) {
      const validation = validateCsvFile(file)
      if (!validation.isValid) {
        setError(`${file.name}: ${validation.errors.join(', ')}`)
        return
      }

      newEntries.push({
        id: `csv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        file,
        transactions: [],
        status: 'pending',
      })
    }

    setError(null)
    setSuccess(null)
    setCombinedResult(null)
    setFiles((prev) => [...prev, ...newEntries])
  }, [files.length])

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
    setCombinedResult(null)
    setError(null)
    setSuccess(null)
  }, [])

  const clearFiles = useCallback(() => {
    setFiles([])
    setCombinedResult(null)
    setError(null)
    setSuccess(null)
  }, [])

  const processFiles = useCallback(async () => {
    if (files.length === 0) {
      setError('No files to process')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)
    setProgress(0)

    const startTime = Date.now()

    try {
      const processedOutputs: CsvFileItem[] = []

      for (let i = 0; i < files.length; i++) {
        const fileItem = files[i]
        setFiles((prev) =>
          prev.map((entry) => (entry.id === fileItem.id ? { ...entry, status: 'processing' } : entry)),
        )

        try {
          const transactions = await processCsvFile(fileItem.file)
          const processed: CsvFileItem = {
            ...fileItem,
            transactions,
            status: 'processed',
            error: undefined,
          }
          processedOutputs.push(processed)
          setFiles((prev) => prev.map((entry) => (entry.id === fileItem.id ? processed : entry)))
        } catch (processingError) {
          const message = processingError instanceof Error ? processingError.message : 'Unknown error'
          const errored: CsvFileItem = {
            ...fileItem,
            status: 'error',
            error: message,
          }
          processedOutputs.push(errored)
          setFiles((prev) => prev.map((entry) => (entry.id === fileItem.id ? errored : entry)))
        }

        const processingProgress = Math.round(((i + 1) / files.length) * 50)
        setProgress(processingProgress)
      }

      const successfulTransactions = processedOutputs
        .filter((entry) => entry.status === 'processed')
        .map((entry) => entry.transactions)

      if (successfulTransactions.length === 0) {
        throw new Error('No files were processed successfully')
      }

      setProgress(75)
      const result = combineTransactions(successfulTransactions, startTime)
      setCombinedResult(result)
      setProgress(100)
      setSuccess(
        `Successfully combined ${result.summary.totalFiles} file(s) into ${result.summary.totalTransactions} unique transactions`,
      )
    } catch (processingError) {
      const message = processingError instanceof Error ? processingError.message : 'Unknown error occurred'
      setError(`Error processing files: ${message}`)
    } finally {
      setLoading(false)
      window.setTimeout(() => setProgress(0), 2000)
    }
  }, [files])

  const downloadCombinedCsv = useCallback(() => {
    if (!combinedResult) return

    const headers = ['date', 'description', 'amount', 'type', 'category']
    const csvRows = [
      headers.join(','),
      ...combinedResult.transactions.map((txn) => {
        const sanitizedDescription = txn.description.replace(/"/g, '""')
        return [
          txn.date,
          `"${sanitizedDescription}"`,
          txn.amount,
          txn.type,
          txn.category || '',
        ].join(',')
      }),
    ]

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `combined-transactions-${new Date().toISOString().split('T')[0]}.csv`
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [combinedResult])

  return useMemo(
    () => ({
      files,
      combinedResult,
      loading,
      progress,
      error,
      success,
      addFiles,
      removeFile,
      clearFiles,
      processFiles,
      downloadCombinedCsv,
    }),
    [
      files,
      combinedResult,
      loading,
      progress,
      error,
      success,
      addFiles,
      removeFile,
      clearFiles,
      processFiles,
      downloadCombinedCsv,
    ],
  )
}
