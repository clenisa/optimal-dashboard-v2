"use client"

import { useCallback } from 'react'
import type { DragEvent } from 'react'

interface UseFileDropOptions {
  onFiles: (files: File[]) => void
}

export interface FileDropHandlers {
  onDragOver: (event: DragEvent<HTMLDivElement>) => void
  onDragEnter: (event: DragEvent<HTMLDivElement>) => void
  onDragLeave: (event: DragEvent<HTMLDivElement>) => void
  onDrop: (event: DragEvent<HTMLDivElement>) => void
}

export function useFileDrop({ onFiles }: UseFileDropOptions): FileDropHandlers {
  const prevent = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      prevent(event)
      const files = Array.from(event.dataTransfer.files ?? [])
      if (files.length > 0) {
        onFiles(files)
      }
    },
    [onFiles, prevent],
  )

  return {
    onDragOver: prevent,
    onDragEnter: prevent,
    onDragLeave: prevent,
    onDrop: handleDrop,
  }
}
