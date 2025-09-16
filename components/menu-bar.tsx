"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Apple, Settings, Info, Power, User } from "lucide-react"
import { Clock } from "@/components/clock"
import { VolumeControl } from "@/components/volume-control"
import { useTheme } from "next-themes"

export function MenuBar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()

  const menuItems = [
    {
      id: "apple",
      label: "🍎",
      icon: Apple,
      items: [
        { label: "About This Desktop", action: () => console.log("About") },
        { type: "separator" },
        { label: "System Preferences", icon: Settings, action: () => console.log("Preferences") },
        { type: "separator" },
        { label: "Log Out", icon: Power, action: () => console.log("Logout") },
      ]
    },
    {
      id: "file",
      label: "File",
      items: [
        { label: "New Window", shortcut: "⌘N", action: () => console.log("New") },
        { label: "Open", shortcut: "⌘O", action: () => console.log("Open") },
        { type: "separator" },
        { label: "Close Window", shortcut: "⌘W", action: () => console.log("Close") },
      ]
    },
    {
      id: "edit",
      label: "Edit",
      items: [
        { label: "Undo", shortcut: "⌘Z", action: () => console.log("Undo") },
        { label: "Redo", shortcut: "⌘⇧Z", action: () => console.log("Redo") },
        { type: "separator" },
        { label: "Cut", shortcut: "⌘X", action: () => console.log("Cut") },
        { label: "Copy", shortcut: "⌘C", action: () => console.log("Copy") },
        { label: "Paste", shortcut: "⌘V", action: () => console.log("Paste") },
      ]
    },
    {
      id: "view",
      label: "View",
      items: [
        { 
          label: theme === "dark" ? "Light Mode" : "Dark Mode", 
          action: () => setTheme(theme === "dark" ? "light" : "dark") 
        },
        { type: "separator" },
        { label: "Show Desktop", action: () => console.log("Show Desktop") },
        { label: "Hide Desktop Icons", action: () => console.log("Hide Icons") },
      ]
    },
  ]

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-banner",
      "h-7 bg-background/80 backdrop-blur-md border-b border-border/50",
      "flex items-center justify-between px-2"
    )}>
      {/* Left side - Menu items */}
      <div className="flex items-center">
        {menuItems.map((menu) => (
          <DropdownMenu key={menu.id}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-6 px-2 text-sm font-medium",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  activeMenu === menu.id && "bg-accent text-accent-foreground"
                )}
                onMouseEnter={() => setActiveMenu(menu.id)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                {menu.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="start" 
              className="min-w-48 animate-slide-down"
            >
              {menu.items.map((item, index) => (
                item.type === "separator" ? (
                  <DropdownMenuSeparator key={index} />
                ) : (
                  <DropdownMenuItem
                    key={index}
                    onClick={item.action}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span>{item.label}</span>
                    </div>
                    {item.shortcut && (
                      <span className="text-xs text-muted-foreground">
                        {item.shortcut}
                      </span>
                    )}
                  </DropdownMenuItem>
                )
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>

      {/* Right side - System controls */}
      <div className="flex items-center gap-2">
        <VolumeControl />
        <Clock />
      </div>
    </div>
  )
}
