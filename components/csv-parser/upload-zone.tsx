"use client"

import { Upload, CheckCircle } from 'lucide-react'
import type { ChangeEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { FileDropHandlers } from '@/hooks/use-file-drop'
import { cn } from '@/lib/utils'

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

  const baseClasses = 'rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200'
  const stateClasses = loading
    ? 'border-border/60 bg-muted/40'
    : file
    ? 'border-emerald-500/70 bg-emerald-500/15 dark:bg-emerald-500/10'
    : 'border-border/60 hover:border-primary/50 hover:bg-primary/10'

  return (
    <div className={cn(baseClasses, stateClasses)} {...dropHandlers}>
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
            <CheckCircle className="mx-auto h-12 w-12 text-emerald-500" />
            <div className="text-lg font-medium text-emerald-600 dark:text-emerald-300">{file.name}</div>
            <div className="text-sm text-emerald-600 dark:text-emerald-400">
              {(file.size / 1024).toFixed(2)} KB
            </div>
            <div className="text-xs text-emerald-500">File selected successfully!</div>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <div className="text-lg font-medium text-foreground">Click to select or drag and drop a CSV file</div>
            <div className="text-sm text-muted-foreground">
              Supports .csv files up to 10MB
            </div>
            <div className="text-xs text-muted-foreground">Drag your file here or click to browse</div>
          </div>
        )}
      </Label>
    </div>
  )
}
