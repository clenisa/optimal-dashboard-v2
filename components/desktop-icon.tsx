"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DesktopIconProps {
  id: string
  title: string
  icon: string
  onClick: () => void
  className?: string
  disabled?: boolean
}

export function DesktopIcon({ 
  id, 
  title, 
  icon, 
  onClick, 
  className,
  disabled = false 
}: DesktopIconProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-col items-center gap-2 p-3 h-auto min-h-[80px] w-20",
        "hover:bg-accent/50 hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "transition-all duration-200 group",
        "rounded-lg border border-transparent",
        "hover:border-border/50 hover:shadow-sm",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      aria-label={`Open ${title}`}
    >
      <div className="relative">
        <img 
          src={icon} 
          alt=""
          className={cn(
            "w-8 h-8 transition-transform duration-200",
            "group-hover:scale-110 group-active:scale-95"
          )}
          onError={(e) => {
            // Fallback to a default icon or hide
            e.currentTarget.src = "/images/default-app.png"
          }}
        />
        {disabled && (
          <div className="absolute inset-0 bg-muted/50 rounded" />
        )}
      </div>
      
      <span className={cn(
        "text-xs font-medium text-center leading-tight",
        "group-hover:text-foreground transition-colors duration-200",
        "text-balance max-w-full"
      )}>
        {title}
      </span>
    </Button>
  )
}
