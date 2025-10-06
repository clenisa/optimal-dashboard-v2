"use client"

import { useCallback, useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { processCsvFile, type ParsedTransaction } from '@/lib/csv-parser'
import { CONTENT } from '@/lib/content'
import { logCsvProcessing, validateCsvFile } from '@/lib/csv-utils'
import {
  validateTransactions,
  type BatchValidationResult,
} from '@/lib/csv/transaction-validation'
import {
  deleteAllTransactions,
  uploadTransactionsToSupabase,
} from '@/lib/csv/upload'
import type { ProcessingStats } from '@/lib/csv/types'

interface UseCsvParserResult {
  state: {
    file: File | null
    transactions: ParsedTransaction[]
    validationResult: BatchValidationResult | null
    processingStats: ProcessingStats | null
    loading: boolean
    uploadProgress: number
    error: string | null
    success: string | null
    debugInfo: string[]
  }
  onFileSelected: (file: File) => void
  resetFile: () => void
  parseFile: () => Promise<void>
  uploadToSupabase: () => Promise<void>
  deleteAll: () => Promise<void>
  setError: (message: string | null) => void
  setSuccess: (message: string | null) => void
  appendDebug: (message: string) => void
}

export function useCsvParser(user: User | null): UseCsvParserResult {
  const [file, setFile] = useState<File | null>(null)
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([])
  const [validationResult, setValidationResult] = useState<BatchValidationResult | null>(null)
  const [processingStats, setProcessingStats] = useState<ProcessingStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const appendDebug = useCallback((message: string) => {
    setDebugInfo((prev) => [...prev, message])
  }, [])

  const onFileSelected = useCallback((selectedFile: File) => {
    setError(null)
    setSuccess(null)
    setProcessingStats(null)
    setTransactions([])
    setDebugInfo([])

    const validation = validateCsvFile(selectedFile)
    if (!validation.isValid) {
      setError(validation.errors.join(', '))
      return
    }

    const fileDetails = [
      `File selected: ${selectedFile.name}`,
      `Size: ${(selectedFile.size / 1024).toFixed(2)} KB`,
      `Type: ${selectedFile.type || 'unknown'}`,
      `Last modified: ${new Date(selectedFile.lastModified).toLocaleString()}`,
    ]
    setDebugInfo(fileDetails)
    logCsvProcessing('File selected', {
      fileName: selectedFile.name,
      size: selectedFile.size,
    })
    setFile(selectedFile)
  }, [])

  const resetFile = useCallback(() => {
    setFile(null)
    setTransactions([])
    setValidationResult(null)
    setProcessingStats(null)
    setUploadProgress(0)
  }, [])

  const parseFile = useCallback(async () => {
    if (!file) {
      setError(CONTENT.csvUpload.messages.noFile)
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)
    setUploadProgress(0)

    const startTime = Date.now()

    try {
      appendDebug(CONTENT.csvUpload.messages.loading)
      const parsedTransactions = await processCsvFile(file)
      logCsvProcessing('Processing complete', { rowCount: parsedTransactions.length })
      appendDebug(`Parsed ${parsedTransactions.length} rows from CSV`)

      const validation = validateTransactions(parsedTransactions)
      setValidationResult(validation)

      const processingTime = Date.now() - startTime
      const stats: ProcessingStats = {
        totalRows: parsedTransactions.length,
        validRows: validation.processedCount,
        invalidRows: validation.skippedCount,
        duplicateRows: validation.warnings.filter((warning) => warning.includes('Duplicate')).length,
        processingTime,
      }
      setProcessingStats(stats)

      if (validation.isValid) {
        setTransactions(parsedTransactions)
        setSuccess(CONTENT.csvUpload.messages.success)
        appendDebug(`Validation completed: ${validation.processedCount} valid transactions`)
      } else {
        setError(`Validation failed: ${validation.errors.length} errors found`)
        appendDebug(`Validation failed with ${validation.errors.length} errors`)
      }
    } catch (parseError) {
      const message = parseError instanceof Error ? parseError.message : 'Unknown error occurred'
      setError(CONTENT.csvUpload.messages.error)
      appendDebug(`Parsing error: ${message}`)
    } finally {
      setLoading(false)
    }
  }, [file, appendDebug])

  const uploadToSupabase = useCallback(async () => {
    if (transactions.length === 0) {
      setError('No transactions to upload')
      return
    }

    if (!user?.id) {
      setError('You must be logged in to upload transactions')
      return
    }

    if (!validationResult?.isValid) {
      setError('Cannot upload invalid transactions. Please fix validation errors first.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)
    setUploadProgress(0)

    try {
      appendDebug('Starting upload to Supabase...')
      const uploadedCount = await uploadTransactionsToSupabase({
        userId: user.id,
        transactions,
        onProgress: (progress, batch, totalBatches) => {
          setUploadProgress(progress)
          appendDebug(`Uploaded batch ${batch}/${totalBatches}`)
        },
      })

      setSuccess(`Successfully uploaded ${uploadedCount} transactions to Supabase`)
      appendDebug(`Upload completed: ${uploadedCount} transactions`)
      resetFile()
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : 'Unknown error occurred'
      setError(`Error uploading to Supabase: ${message}`)
      appendDebug(`Upload error: ${message}`)
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }, [appendDebug, resetFile, transactions, user?.id, validationResult])

  const deleteAll = useCallback(async () => {
    if (!user) {
      setError('User not authenticated')
      return
    }

    if (!confirm('Are you sure you want to delete ALL transactions? This cannot be undone.')) {
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await deleteAllTransactions(user.id)
      setSuccess('Successfully deleted all transactions')
      resetFile()
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : 'Failed to delete transactions'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [resetFile, user])

  const state = useMemo(
    () => ({
      file,
      transactions,
      validationResult,
      processingStats,
      loading,
      uploadProgress,
      error,
      success,
      debugInfo,
    }),
    [
      file,
      transactions,
      validationResult,
      processingStats,
      loading,
      uploadProgress,
      error,
      success,
      debugInfo,
    ],
  )

  return {
    state,
    onFileSelected,
    resetFile,
    parseFile,
    uploadToSupabase,
    deleteAll,
    setError,
    setSuccess,
    appendDebug,
  }
}
