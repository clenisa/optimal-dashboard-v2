"use client"

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trash2 } from 'lucide-react'

interface CsvActionButtonsProps {
  loading: boolean
  hasFile: boolean
  canUpload: boolean
  uploadProgress: number
  error: string | null
  success: string | null
  onParse: () => void
  onUpload: () => void
  onDelete: () => void
}

export function CsvActionButtons({
  loading,
  hasFile,
  canUpload,
  uploadProgress,
  error,
  success,
  onParse,
  onUpload,
  onDelete,
}: CsvActionButtonsProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={onParse} disabled={!hasFile || loading} className="flex-1">
          {loading ? 'Parsing...' : 'Parse CSV'}
        </Button>

        {canUpload && (
          <Button onClick={onUpload} disabled={loading} variant="outline" className="flex-1">
            {loading ? 'Uploading...' : 'Upload to Supabase'}
          </Button>
        )}

        <Button onClick={onDelete} disabled={loading} variant="destructive" className="flex items-center gap-2">
          <Trash2 className="h-4 w-4" />
          Delete All
        </Button>
      </div>

      {loading && uploadProgress > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Upload Progress</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
