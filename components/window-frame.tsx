"use client"

import type React from "react"
import { useWindowStore } from "@/store/window-store"
import { useWindowManager } from "@/hooks/use-window-manager"
import { X } from "lucide-react"
import { useVibration } from "@/hooks/use-vibration"
// Utility to merge Tailwind CSS classes conditionally
function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ")
}

interface WindowFrameProps {
  id: string
  title: string
  x: number
  y: number
  width: number
  height: number
  minimized: boolean
  zIndex: number
  children: React.ReactNode
  transparentBackground?: boolean
}

export function WindowFrame({
  id,
  title,
  x,
  y,
  width,
  height,
  minimized,
  zIndex,
  children,
  transparentBackground = false,
}: WindowFrameProps) {
  const removeWindow = useWindowStore((state) => state.removeWindow)
  const windows = useWindowStore((state) => state.windows)
  const focusWindow = useWindowStore((state) => state.focusWindow)
  const { windowRef } = useWindowManager({
    windowId: id,
    initialX: x,
    initialY: y,
    initialWidth: width,
    initialHeight: height,
  })
  const vibrate = useVibration({ duration: 30 })

  const maxZIndex = Math.max(...windows.map((w) => w.zIndex))
  const isForeground = zIndex === maxZIndex

  if (minimized) {
    return null
  }

  const handleClose = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    removeWindow(id)
    vibrate()
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const touch = e.changedTouches[0]
    const element = document.elementFromPoint(touch.clientX, touch.clientY)
    const button = e.currentTarget

    if (element === button || button.contains(element as Node)) {
      removeWindow(id)
      vibrate()
    }
  }

  return (
    <div
      ref={windowRef}
      className="absolute flex flex-col animate-window-open select-none"
      onMouseDown={() => focusWindow(id)}
      onTouchStart={() => focusWindow(id)}
      style={{
        left: x,
        top: y,
        width: width,
        height: height,
        zIndex: zIndex,
      }}
    >
      <div
        className={cn(
          "w-full h-full flex flex-col border-[2px] border-black rounded-lg overflow-hidden",
          transparentBackground ? "bg-transparent" : "bg-system7-window-bg",
          isForeground ? "shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]" : "",
        )}
        style={{
          backgroundColor: transparentBackground ? 'transparent' : 'var(--system7-window-bg)',
          opacity: 1,
        }}
      >
        {/* Title Bar */}
        <div className="window-title-bar flex justify-between items-center bg-black text-white px-3 py-2 cursor-grab active:cursor-grabbing select-none touch-manipulation h-10 sm:h-7 rounded-t-md">
          <span className="text-xs sm:text-xs font-mono pointer-events-none truncate flex-1 mr-2">{title}</span>
          <button
            onClick={handleClose}
            onTouchEnd={handleTouchEnd}
            className="window-close-button"
            aria-label="Close window"
            data-testid="window-close-button"
          >
            <X size={12} className="pointer-events-none" />
          </button>
        </div>

        {/* Content Area */}
        <div
          className="flex-grow p-3 sm:p-4 overflow-auto text-black"
          style={{
            pointerEvents: "auto",
            isolation: "isolate",
            position: "relative",
            zIndex: 1,
            backgroundColor: transparentBackground ? 'transparent' : 'var(--system7-window-bg)',
          }}
          onMouseDown={(e) => {
            e.stopPropagation()
          }}
          onTouchStart={(e) => {
            e.stopPropagation()
          }}
        >
          {children}
        </div>

        {/* Resize Handle */}
        <div className="window-resize-handle" />
      </div>
    </div>
  )
}
