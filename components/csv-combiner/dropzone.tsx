"use client"

import { Upload } from 'lucide-react'
import type { ChangeEvent } from 'react'
import type { FileDropHandlers } from '@/hooks/use-file-drop'
import { cn } from '@/lib/utils'

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

  const baseClasses = 'cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200'
  const stateClasses = loading
    ? 'border-border/60 bg-muted/40'
    : reachedLimit
    ? 'border-border/60 bg-muted/50 opacity-50 cursor-not-allowed'
    : 'border-border/60 hover:border-primary/50 hover:bg-primary/10'

  return (
    <label className={cn(baseClasses, stateClasses)} {...dropHandlers}>
      <input
        type="file"
        multiple
        accept=".csv"
        className="hidden"
        disabled={loading || reachedLimit}
        onChange={handleChange}
      />
      <div className="space-y-3">
        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
        <div className="text-lg font-medium text-foreground">Drag & drop CSV files or click to browse</div>
        <div className="text-sm text-muted-foreground">
          {fileCount}/{limit} files selected (max {limit})
        </div>
        <div className="text-xs text-muted-foreground">Each file is validated before combining</div>
      </div>
    </label>
  )
}
