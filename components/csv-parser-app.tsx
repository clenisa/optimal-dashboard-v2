"use client"

import { useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CategoryEditor } from '@/components/editors/CategoryEditor'
import { PaymentSourceEditor } from '@/components/editors/PaymentSourceEditor'
import { CsvUploadZone } from '@/components/csv-parser/upload-zone'
import { CsvActionButtons } from '@/components/csv-parser/action-buttons'
import { ValidationResults } from '@/components/csv-parser/validation-results'
import { TransactionsPreview } from '@/components/csv-parser/transactions-preview'
import { DebugInformation } from '@/components/csv-parser/debug-information'
import { useAuthState } from '@/hooks/use-auth-state'
import { useCsvParser } from '@/hooks/use-csv-parser'
import { useFileDrop } from '@/hooks/use-file-drop'

export function CsvParserApp() {
  const { user } = useAuthState()
  const {
    state: {
      file,
      transactions,
      validationResult,
      processingStats,
      loading,
      uploadProgress,
      error,
      success,
      debugInfo,
    },
    onFileSelected,
    parseFile,
    uploadToSupabase,
    deleteAll,
  } = useCsvParser(user)

  const dropHandlers = useFileDrop({
    onFiles: (files) => {
      const nextFile = files[0]
      if (nextFile) {
        onFileSelected(nextFile)
      }
    },
  })

  const canUpload = useMemo(
    () => transactions.length > 0 && Boolean(validationResult?.isValid),
    [transactions.length, validationResult?.isValid],
  )

  if (!user) {
    return (
      <div className="p-6">
        <Alert className="border-border/60 bg-muted/40">
          <AlertDescription>Please log in to use the CSV Parser</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/70">
        <CardHeader>
          <CardTitle>CSV Transaction Importer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
            <div className="space-y-4">
              <CsvUploadZone
                file={file}
                loading={loading}
                dropHandlers={dropHandlers}
                onFileSelect={onFileSelected}
              />

              <CsvActionButtons
                loading={loading}
                hasFile={Boolean(file)}
                canUpload={canUpload}
                uploadProgress={uploadProgress}
                error={error}
                success={success}
                onParse={() => void parseFile()}
                onUpload={() => void uploadToSupabase()}
                onDelete={() => void deleteAll()}
              />
            </div>

            <div className="space-y-4">
              <Card className="border border-border/60 bg-muted/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Upload Checklist</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <ChecklistItem label="File must be CSV format" completed={Boolean(file)} />
                  <ChecklistItem
                    label="Parse CSV to run validation"
                    completed={transactions.length > 0}
                  />
                  <ChecklistItem
                    label="Fix validation errors before uploading"
                    completed={Boolean(validationResult?.isValid)}
                  />
                </CardContent>
              </Card>

              {validationResult && (
                <ValidationResults validation={validationResult} processingStats={processingStats} />
              )}

              <TransactionsPreview transactions={transactions} />

              <DebugInformation debugInfo={debugInfo} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/70">
        <CardHeader>
          <CardTitle>CSV Helpers</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 gap-2 rounded-lg bg-muted/60 p-1">
              <TabsTrigger value="overview" className="rounded-md text-sm font-medium">
                Overview
              </TabsTrigger>
              <TabsTrigger value="categories" className="rounded-md text-sm font-medium">
                Categories
              </TabsTrigger>
              <TabsTrigger value="sources" className="rounded-md text-sm font-medium">
                Payment Sources
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <ScrollArea className="h-48">
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Upload bank statements and transaction exports as CSV files. We validate data,
                    surface duplicates, and offer quick editing tools via the tabs above.
                  </p>
                  <p>
                    Once parsed you can review the first few transactions, fix validation errors,
                    and upload directly into Supabase.
                  </p>
                  {validationResult && (
                    <p className="flex items-center gap-2">
                      <Badge variant={validationResult.isValid ? 'default' : 'destructive'}>
                        {validationResult.isValid ? 'Ready to upload' : 'Needs attention'}
                      </Badge>
                      {validationResult.isValid
                        ? 'All validation checks passed.'
                        : 'Resolve the issues above before uploading.'}
                    </p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="categories">
              <CategoryEditor />
            </TabsContent>

            <TabsContent value="sources">
              <PaymentSourceEditor />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function ChecklistItem({ label, completed }: { label: string; completed: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Badge variant={completed ? 'default' : 'outline'} className="w-5 justify-center p-0">
        {completed ? '✓' : '–'}
      </Badge>
      <span>{label}</span>
    </div>
  )
}
