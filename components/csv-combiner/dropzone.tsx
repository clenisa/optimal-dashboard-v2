"use client"

import { Upload } from 'lucide-react'
import type { ChangeEvent } from 'react'
import type { FileDropHandlers } from '@/hooks/use-file-drop'

interface CombinerDropzoneProps {
  loading: boolean
  fileCount: number
  limit: number
  dropHandlers: FileDropHandlers
  onFilesSelected: (files: FileList) => void
}

export function CombinerDropzone({
  loading,
  fileCount,
  limit,
  dropHandlers,
  onFilesSelected,
}: CombinerDropzoneProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      onFilesSelected(files)
      event.target.value = ''
    }
  }

  const reachedLimit = fileCount >= limit

  return (
    <label
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ${
        loading
          ? 'border-gray-300 bg-gray-50 dark:bg-gray-800'
          : reachedLimit
          ? 'border-gray-300 bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed'
          : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
      }`}
      {...dropHandlers}
    >
      <input
        type="file"
        multiple
        accept=".csv"
        className="hidden"
        disabled={loading || reachedLimit}
        onChange={handleChange}
      />
      <div className="space-y-3">
        <Upload className="h-12 w-12 text-gray-400 mx-auto" />
        <div className="text-lg font-medium">Drag & drop CSV files or click to browse</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {fileCount}/{limit} files selected (max {limit})
        </div>
        <div className="text-xs text-gray-400">Each file is validated before combining</div>
      </div>
    </label>
  )
}
