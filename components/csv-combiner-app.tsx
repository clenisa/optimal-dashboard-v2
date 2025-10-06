"use client"

import { Combine } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useCsvCombiner } from '@/hooks/use-csv-combiner'
import { useFileDrop } from '@/hooks/use-file-drop'
import { CombinerDropzone } from '@/components/csv-combiner/dropzone'
import { CombinerFileList } from '@/components/csv-combiner/file-list'
import { CombinerResultSummary } from '@/components/csv-combiner/result-summary'

const FILE_LIMIT = 5

export function CsvCombinerApp() {
  const {
    files,
    combinedResult,
    loading,
    progress,
    error,
    success,
    addFiles,
    removeFile,
    clearFiles,
    processFiles,
    downloadCombinedCsv,
  } = useCsvCombiner()

  const dropHandlers = useFileDrop({
    onFiles: (droppedFiles) => addFiles(droppedFiles),
  })

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Combine className="h-5 w-5" />
            CSV Combiner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Merge up to {FILE_LIMIT} CSV files into one deduplicated export. We remove duplicates by
            comparing date, amount, description, type, and category fields.
          </p>

          <CombinerDropzone
            loading={loading}
            fileCount={files.length}
            limit={FILE_LIMIT}
            dropHandlers={dropHandlers}
            onFilesSelected={(fileList) => addFiles(Array.from(fileList))}
          />

          <CombinerFileList files={files} loading={loading} onRemove={removeFile} />

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void processFiles()} disabled={loading || files.length === 0}>
              {loading ? 'Processing...' : 'Combine CSVs'}
            </Button>
            <Button onClick={clearFiles} disabled={loading || files.length === 0} variant="outline">
              Clear Files
            </Button>
            <Button
              onClick={downloadCombinedCsv}
              disabled={!combinedResult || loading}
              variant="secondary"
            >
              Download Combined CSV
            </Button>
          </div>

          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
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

          <CombinerResultSummary
            result={combinedResult}
            loading={loading}
            onDownload={downloadCombinedCsv}
          />
        </CardContent>
      </Card>
    </div>
  )
}
