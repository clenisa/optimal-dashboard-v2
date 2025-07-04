"use client"

import { useEffect, useRef, useCallback } from "react"
import { useWindowStore } from "@/store/window-store"
import { useVibration } from "./use-vibration"
import { InteractionDetector } from "@/lib/interaction-detector"
import { authLogger } from "@/lib/auth-logger"

interface UseWindowManagerProps {
  windowId: string
  initialX: number
  initialY: number
  initialWidth: number
  initialHeight: number
}

export function useWindowManager({ windowId, initialX, initialY, initialWidth, initialHeight }: UseWindowManagerProps) {
  const updateWindow = useWindowStore((state) => state.updateWindow)
  const focusWindow = useWindowStore((state) => state.focusWindow)
  const windowRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const isResizing = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const resizeStart = useRef({ x: 0, y: 0 })
  const initialWindow = useRef({ width: 0, height: 0 })

  const vibrate = useVibration({ duration: 50 })

  const constrainToViewport = useCallback((x: number, y: number, width: number, height: number) => {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const minVisible = 50

    return {
      x: Math.max(minVisible - width, Math.min(x, viewportWidth - minVisible)),
      y: Math.max(0, Math.min(y, viewportHeight - minVisible)),
      width: Math.min(width, viewportWidth),
      height: Math.min(height, viewportHeight),
    }
  }, [])

  const startInteraction = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!windowRef.current) return

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
      const target = e.target as HTMLElement

      const isTitleBar = target.closest(".window-title-bar") !== null
      const isResizeHandle = target.closest(".window-resize-handle") !== null
      const isInteractive = InteractionDetector.isInteractive(target, windowRef)

      // Log the interaction for debugging
      authLogger.interaction("Window interaction", "start", {
        windowId,
        isTitleBar,
        isResizeHandle,
        isInteractive,
        elementInfo: InteractionDetector.getElementInfo(target),
        eventType: "touches" in e ? "touch" : "mouse",
      })

      // If it's an interactive element and NOT on title bar or resize handle,
      // don't do ANYTHING - let the browser handle it completely
      if (!isTitleBar && !isResizeHandle && isInteractive) {
        authLogger.interaction("Completely ignoring interactive element", "passthrough", {
          windowId,
          element: target.tagName,
        })
        return // Don't even focus the window - let the element handle everything
      }

      // Only focus window for non-interactive areas or window controls
      focusWindow(windowId)

      // Only vibrate and handle dragging/resizing for title bar and resize handle
      if (isTitleBar || isResizeHandle) {
        vibrate()
      }

      if (isTitleBar) {
        // Prevent default only for title bar dragging
        e.preventDefault()
        e.stopPropagation()
        
        // Add body scroll lock on mobile to prevent page scrolling during drag
        if ("touches" in e) {
          document.body.style.overflow = "hidden"
          document.body.style.touchAction = "none"
        }
        
        isDragging.current = true
        const rect = windowRef.current.getBoundingClientRect()
        dragOffset.current = {
          x: clientX - rect.left,
          y: clientY - rect.top,
        }
      } else if (isResizeHandle) {
        // Prevent default only for resize handle
        e.preventDefault()
        e.stopPropagation()
        
        // Add body scroll lock on mobile
        if ("touches" in e) {
          document.body.style.overflow = "hidden"
          document.body.style.touchAction = "none"
        }
        
        isResizing.current = true
        resizeStart.current = { x: clientX, y: clientY }
        initialWindow.current = {
          width: windowRef.current.offsetWidth,
          height: windowRef.current.offsetHeight,
        }
      }
    },
    [focusWindow, windowId, vibrate],
  )

  const moveInteraction = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current && !isResizing.current) return

      // Only prevent default when we're actually dragging/resizing
      if ("touches" in e) {
        e.preventDefault()
        e.stopPropagation()
      }

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

      if (isDragging.current && windowRef.current) {
        const newX = clientX - dragOffset.current.x
        const newY = clientY - dragOffset.current.y
        const currentWidth = windowRef.current.offsetWidth
        const currentHeight = windowRef.current.offsetHeight

        const constrained = constrainToViewport(newX, newY, currentWidth, currentHeight)
        updateWindow(windowId, { x: constrained.x, y: constrained.y })
      } else if (isResizing.current && windowRef.current) {
        const deltaX = clientX - resizeStart.current.x
        const deltaY = clientY - resizeStart.current.y

        const newWidth = Math.max(300, initialWindow.current.width + deltaX)
        const newHeight = Math.max(200, initialWindow.current.height + deltaY)

        const currentRect = windowRef.current.getBoundingClientRect()
        const constrained = constrainToViewport(currentRect.left, currentRect.top, newWidth, newHeight)
        updateWindow(windowId, { width: constrained.width, height: constrained.height })
      }
    },
    [updateWindow, windowId, constrainToViewport],
  )

  const endInteraction = useCallback(() => {
    if (isDragging.current || isResizing.current) {
      authLogger.interaction("Window interaction", "end", {
        windowId,
        wasDragging: isDragging.current,
        wasResizing: isResizing.current,
      })
      
      // Restore body scroll on mobile
      document.body.style.overflow = ""
      document.body.style.touchAction = ""
    }
    isDragging.current = false
    isResizing.current = false
  }, [windowId])

  useEffect(() => {
    const currentWindowRef = windowRef.current
    if (currentWindowRef) {
      currentWindowRef.addEventListener("mousedown", startInteraction, { passive: false, capture: false })
      currentWindowRef.addEventListener("touchstart", startInteraction, { passive: false, capture: false })
    }

    window.addEventListener("mousemove", moveInteraction, { passive: false })
    window.addEventListener("touchmove", moveInteraction, { passive: false })
    window.addEventListener("mouseup", endInteraction)
    window.addEventListener("touchend", endInteraction)
    window.addEventListener("touchcancel", endInteraction)

    return () => {
      if (currentWindowRef) {
        currentWindowRef.removeEventListener("mousedown", startInteraction)
        currentWindowRef.removeEventListener("touchstart", startInteraction)
      }
      window.removeEventListener("mousemove", moveInteraction)
      window.removeEventListener("touchmove", moveInteraction)
      window.removeEventListener("mouseup", endInteraction)
      window.removeEventListener("touchend", endInteraction)
      window.removeEventListener("touchcancel", endInteraction)
    }
  }, [startInteraction, moveInteraction, endInteraction])

  useEffect(() => {
    const constrained = constrainToViewport(initialX, initialY, initialWidth, initialHeight)
    updateWindow(windowId, constrained)
  }, [windowId, initialX, initialY, initialWidth, initialHeight, updateWindow, constrainToViewport])

  return { windowRef }
}
