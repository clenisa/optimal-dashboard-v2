"use client"

import { memo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface LoadingSkeletonProps {
  lines?: number
  pulse?: boolean
  className?: string
  lineClassName?: string
  widths?: string[]
}

const defaultWidths = ['100%', '92%', '85%', '78%', '88%']

export const LoadingSkeleton = memo(function LoadingSkeleton({
  lines = 3,
  pulse = true,
  className,
  lineClassName,
  widths = defaultWidths,
}: LoadingSkeletonProps) {
  const lineCount = Math.max(1, lines)

  return (
    <div className={cn('space-y-2', pulse ? 'animate-in' : undefined, className)}>
      {Array.from({ length: lineCount }).map((_, index) => (
        <Skeleton
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className={cn(
            'h-4 w-full rounded-md',
            lineClassName,
            { 'h-8': lineCount === 1 },
          )}
          style={{ width: widths[index % widths.length] }}
        />
      ))}
    </div>
  )
})
