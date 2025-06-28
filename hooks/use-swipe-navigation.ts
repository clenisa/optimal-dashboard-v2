"use client"

import { useEffect, useRef, useCallback } from "react"
import { useWindowStore } from "@/store/window-store"
import { useVibration } from "./use-vibration"

export function useSwipeNavigation() {
  const windows = useWindowStore((state) => state.windows)
  const focusWindow = useWindowStore((state) => state.focusWindow)
  const touchStartX = useRef(0)
  const touchStartTime = useRef(0)
  const vibrate = useVibration({ duration: 30 })

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartTime.current = Date.now()
  }, [])

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX
      const touchEndTime = Date.now()
      const swipeDistance = touchEndX - touchStartX.current
      const swipeDuration = touchEndTime - touchStartTime.current

      // Define a threshold for a valid swipe
      const minSwipeDistance = 50 // pixels
      const maxSwipeDuration = 300 // milliseconds

      if (Math.abs(swipeDistance) > minSwipeDistance && swipeDuration < maxSwipeDuration) {
        const openWindows = windows.filter((w) => !w.minimized).sort((a, b) => a.zIndex - b.zIndex)
        if (openWindows.length <= 1) return

        const focusedWindowIndex = openWindows.findIndex(
          (w) => w.zIndex === Math.max(...openWindows.map((w) => w.zIndex)),
        )

        if (swipeDistance < 0) {
          // Swiped left (next window)
          const nextIndex = (focusedWindowIndex + 1) % openWindows.length
          focusWindow(openWindows[nextIndex].id)
          vibrate()
        } else {
          // Swiped right (previous window)
          const prevIndex = (focusedWindowIndex - 1 + openWindows.length) % openWindows.length
          focusWindow(openWindows[prevIndex].id)
          vibrate()
        }
      }
    },
    [windows, focusWindow, vibrate],
  )

  useEffect(() => {
    window.addEventListener("touchstart", handleTouchStart)
    window.addEventListener("touchend", handleTouchEnd)

    return () => {
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchend", handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchEnd])
}
