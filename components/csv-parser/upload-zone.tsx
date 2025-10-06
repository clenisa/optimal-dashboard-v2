"use client"

import { Upload, CheckCircle } from 'lucide-react'
import type { ChangeEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { FileDropHandlers } from '@/hooks/use-file-drop'

interface CsvUploadZoneProps {
  file: File | null
  loading: boolean
  dropHandlers: FileDropHandlers
  onFileSelect: (file: File) => void
}

export function CsvUploadZone({ file, loading, dropHandlers, onFileSelect }: CsvUploadZoneProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0]
    if (nextFile) {
      onFileSelect(nextFile)
      // Reset input so the same file can be selected again if needed.
      event.target.value = ''
    }
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
        loading
          ? 'border-gray-300 bg-gray-50 dark:bg-gray-800'
          : file
          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
      }`}
      {...dropHandlers}
    >
      <Input
        id="csv-file"
        type="file"
        accept=".csv"
        onChange={handleChange}
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
            <div className="text-xs text-gray-400">Drag your file here or click to browse</div>
          </div>
        )}
      </Label>
    </div>
  )
}
