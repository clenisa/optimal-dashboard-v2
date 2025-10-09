"use client"

import { useEffect, useId, useRef, useState } from 'react'
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
  const inputId = useId()
  const statusId = `${inputId}-status`
  const inputRef = useRef<HTMLInputElement>(null)
  const [statusMessage, setStatusMessage] = useState('Ready to add CSV files for combining')

  useEffect(() => {
    if (loading) {
      setStatusMessage('Validating uploaded CSV files...')
    } else if (fileCount === 0) {
      setStatusMessage('No CSV files selected')
    } else if (fileCount >= limit) {
      setStatusMessage(`File limit reached. ${fileCount} of ${limit} files selected.`)
    } else {
      setStatusMessage(`${fileCount} of ${limit} files selected`)
    }
  }, [fileCount, limit, loading])

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
    <label
      className={cn(
        baseClasses,
        stateClasses,
        'w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      )}
      role="button"
      tabIndex={0}
      aria-disabled={loading || reachedLimit}
      aria-describedby={statusId}
      aria-busy={loading}
      onKeyDown={(event) => {
        if ((event.key === 'Enter' || event.key === ' ') && !loading && !reachedLimit) {
          event.preventDefault()
          inputRef.current?.click()
        }
      }}
      {...dropHandlers}
    >
      <div id={statusId} aria-live="polite" className="sr-only">
        {statusMessage}
      </div>
      <input
        type="file"
        multiple
        accept=".csv"
        className="hidden"
        disabled={loading || reachedLimit}
        onChange={handleChange}
        id={inputId}
        ref={inputRef}
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
