import { CSV_UPLOAD } from './constants'
import { logger } from './logger'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export function validateCsvFile(file: File): ValidationResult {
  const errors: string[] = []
  
  // Check file size
  if (file.size > CSV_UPLOAD.MAX_FILE_SIZE) {
    errors.push(`File size exceeds ${CSV_UPLOAD.MAX_FILE_SIZE / (1024 * 1024)}MB limit`)
  }
  
  // Check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!CSV_UPLOAD.ALLOWED_EXTENSIONS.includes(extension)) {
    errors.push('Invalid file format. Please upload a CSV file.')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateCsvHeaders(headers: string[]): ValidationResult {
  const errors: string[] = []
  const missingColumns = CSV_UPLOAD.REQUIRED_COLUMNS.filter(
    col => !headers.includes(col)
  )
  
  if (missingColumns.length > 0) {
    errors.push(`Missing required columns: ${missingColumns.join(', ')}`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function logCsvProcessing(stage: string, data?: any): void {
  logger.debug('CsvParser', stage, data)
}

export function formatFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(2)}MB`
}

export function getFileExtension(filename: string): string {
  return '.' + filename.split('.').pop()?.toLowerCase() || ''
}

