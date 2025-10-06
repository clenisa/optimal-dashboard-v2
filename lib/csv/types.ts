import type { ParsedTransaction } from '@/lib/csv-parser'
import type { BatchValidationResult } from './transaction-validation'

export interface ProcessingStats {
  totalRows: number
  validRows: number
  invalidRows: number
  duplicateRows: number
  processingTime: number
}

export interface CsvParserState {
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

export type CsvFileStatus = 'pending' | 'processing' | 'processed' | 'error'

export interface CsvFileItem {
  id: string
  file: File
  transactions: ParsedTransaction[]
  status: CsvFileStatus
  error?: string
}

export interface CombinedResult {
  transactions: ParsedTransaction[]
  summary: {
    totalFiles: number
    totalTransactions: number
    duplicatesRemoved: number
    processingTime: number
  }
}
