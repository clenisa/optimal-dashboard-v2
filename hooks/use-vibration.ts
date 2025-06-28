// React hook to trigger device vibration with optional debounce.
"use client"

import { useCallback, useRef } from "react"

interface VibrationOptions {
  duration?: number
  pattern?: number | number[]
  debounceTime?: number
}

export function useVibration({ duration = 200, pattern, debounceTime = 50 }: VibrationOptions = {}) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const triggerVibration = useCallback(() => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        navigator.vibrate(pattern || duration)
      }, debounceTime)
    }
  }, [duration, pattern, debounceTime])

  return triggerVibration
}
