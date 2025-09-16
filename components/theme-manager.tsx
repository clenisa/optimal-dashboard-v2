"use client"

import * as React from 'react'
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, Monitor, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

// Theme Provider Component
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// Enhanced Theme Switcher Component
export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, themes } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
        <Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  const getThemeIcon = (currentTheme: string) => {
    switch (currentTheme) {
      case "light":
        return <Sun className="h-4 w-4" />
      case "dark":
        return <Moon className="h-4 w-4" />
      case "system":
        return <Monitor className="h-4 w-4" />
      default:
        return <Palette className="h-4 w-4" />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "h-8 w-8 p-0",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          {getThemeIcon(theme || "system")}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          Appearance
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className={cn(
            "cursor-pointer",
            theme === "light" && "bg-accent text-accent-foreground"
          )}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className={cn(
            "cursor-pointer",
            theme === "dark" && "bg-accent text-accent-foreground"
          )}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className={cn(
            "cursor-pointer",
            theme === "system" && "bg-accent text-accent-foreground"
          )}
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Simple Theme Toggle Component
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled>
        <Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light")
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={toggleTheme}
      className={cn(
        "h-8 w-8 p-0 transition-all duration-200",
        "hover:bg-accent hover:text-accent-foreground hover:scale-105",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "active:scale-95"
      )}
      aria-label={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} mode`}
    >
      {resolvedTheme === "light" ? (
        <Moon className="h-4 w-4 transition-transform duration-200" />
      ) : (
        <Sun className="h-4 w-4 transition-transform duration-200" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

// Main Theme Manager Component
export function ThemeManager() {
  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <ThemeSwitcher />
    </div>
  )
}
