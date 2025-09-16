"use client"

import type React from "react"
import { useWindowStore } from "@/store/window-store"
import { useWindowManager } from "@/hooks/use-window-manager"
import { X, Minus, Maximize2, Minimize2 } from "lucide-react"
import { useVibration } from "@/hooks/use-vibration"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

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
  resizable?: boolean
  draggable?: boolean
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
  resizable = true,
  draggable = true,
}: WindowFrameProps) {
  const removeWindow = useWindowStore((state) => state.removeWindow)
  const updateWindow = useWindowStore((state) => state.updateWindow)
  const focusWindow = useWindowStore((state) => state.focusWindow)
  const windows = useWindowStore((state) => state.windows)
  
  const { windowRef } = useWindowManager({
    windowId: id,
    initialX: x,
    initialY: y,
    initialWidth: width,
    initialHeight: height,
  })
  
  const vibrate = useVibration({ duration: 30 })
  const isActive = Math.max(...windows.map((w) => w.zIndex)) === zIndex

  const handleClose = () => {
    vibrate()
    removeWindow(id)
  }

  const handleMinimize = () => {
    vibrate()
    updateWindow(id, { minimized: true })
  }

  const handleMaximize = () => {
    vibrate()
    const currentWindow = windows.find(w => w.id === id)
    if (currentWindow) {
      const isMaximized = currentWindow.width >= window.innerWidth - 100
      if (isMaximized) {
        updateWindow(id, { 
          width: 800, 
          height: 600, 
          x: 100, 
          y: 100 
        })
      } else {
        updateWindow(id, { 
          width: window.innerWidth - 100, 
          height: window.innerHeight - 150, 
          x: 50, 
          y: 50 
        })
      }
    }
  }

  const handleFocus = () => {
    focusWindow(id)
  }

  if (minimized) return null

  return (
    <div
      ref={windowRef}
      className={cn(
        "absolute overflow-hidden rounded-lg shadow-xl border transition-all duration-200",
        "bg-card text-card-foreground",
        transparentBackground && "glass",
        isActive ? "ring-2 ring-primary/20 shadow-2xl" : "shadow-lg",
        "animate-scale-in"
      )}
      style={{
        left: x,
        top: y,
        width: width,
        height: height,
        zIndex: zIndex,
      }}
      onClick={handleFocus}
    >
      {/* Window Header */}
      <div 
        className={cn(
          "flex items-center justify-between px-4 py-2 border-b cursor-move select-none",
          "bg-muted/50 backdrop-blur-sm",
          isActive ? "bg-primary/5" : "bg-muted/30"
        )}
        data-window-header
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <img 
            src={`/images/${id}.png`} 
            alt=""
            className="w-4 h-4 flex-shrink-0"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          <span className="text-sm font-medium truncate">
            {title}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMinimize}
            className="h-6 w-6 p-0 hover:bg-warning/20 hover:text-warning-foreground"
            aria-label="Minimize window"
          >
            <Minus className="h-3 w-3" />
          </Button>
          
          {resizable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMaximize}
              className="h-6 w-6 p-0 hover:bg-info/20 hover:text-info-foreground"
              aria-label="Maximize window"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive-foreground"
            aria-label="Close window"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Window Content */}
      <div className="h-full overflow-auto bg-background/50">
        {children}
      </div>

      {/* Resize Handle */}
      {resizable && (
        <div
          className={cn(
            "absolute bottom-0 right-0 w-4 h-4 cursor-se-resize",
            "bg-muted/50 hover:bg-muted transition-colors",
            "border-l border-t border-border/50"
          )}
          data-resize-handle
          style={{
            background: `linear-gradient(-45deg, transparent 30%, currentColor 30%, currentColor 40%, transparent 40%, transparent 60%, currentColor 60%, currentColor 70%, transparent 70%)`,
          }}
        />
      )}
    </div>
  )
}
