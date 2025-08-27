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

  const handleClose = () => {
    removeWindow(id)
    vibrate()
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
            className="p-2 hover:bg-red-600 rounded touch-manipulation flex items-center justify-center w-8 h-8 sm:w-5 sm:h-5 text-xs flex-shrink-0"
            aria-label="Close window"
            style={{ touchAction: "manipulation", cursor: "pointer", minWidth: "44px", minHeight: "44px" }}
          >
            <X size={16} />
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
        <div className="window-resize-handle absolute bottom-0 right-0 w-4 h-4 bg-black cursor-nwse-resize touch-manipulation opacity-50 hover:opacity-100 transition-opacity" />
      </div>
    </div>
  )
}
