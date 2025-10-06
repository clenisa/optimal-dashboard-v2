"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { CsvFileItem } from '@/lib/csv/types'
import { X } from 'lucide-react'

interface FileListProps {
  files: CsvFileItem[]
  loading: boolean
  onRemove: (id: string) => void
}

const STATUS_VARIANTS: Record<CsvFileItem['status'], 'default' | 'secondary' | 'destructive'> = {
  pending: 'secondary',
  processing: 'secondary',
  processed: 'default',
  error: 'destructive',
}

export function CombinerFileList({ files, loading, onRemove }: FileListProps) {
  if (files.length === 0) {
    return <p className="text-sm text-muted-foreground">No files added yet.</p>
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between rounded-md border p-3 text-sm"
        >
          <div className="space-y-1">
            <div className="font-medium">{file.file.name}</div>
            <div className="text-xs text-muted-foreground">
              {(file.file.size / 1024).toFixed(2)} KB • {file.transactions.length} transactions
            </div>
            {file.error && <div className="text-xs text-red-600">{file.error}</div>}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={STATUS_VARIANTS[file.status]}>{file.status}</Badge>
            <Button
              size="icon"
              variant="ghost"
              disabled={loading}
              onClick={() => onRemove(file.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
