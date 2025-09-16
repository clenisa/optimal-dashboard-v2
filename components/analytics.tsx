"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Page view:', pathname + (searchParams?.toString() || ''))
    }
  }, [pathname, searchParams])

  return null
}

