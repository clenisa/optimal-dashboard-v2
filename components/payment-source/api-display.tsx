"use client"

import React from "react"
import type { PaymentSource } from "./types"

interface ApiDisplayProps {
  sources: PaymentSource[]
}

export function ApiDisplay({ sources }: ApiDisplayProps) {
  return (
    <div className="mt-4">
      <details className="text-sm">
        <summary className="cursor-pointer select-none">API Data</summary>
        <pre className="mt-2 p-2 bg-muted rounded border overflow-x-auto text-xs">
{JSON.stringify(sources, null, 2)}
        </pre>
      </details>
    </div>
  )
}

