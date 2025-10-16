"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { KeyboardEvent as ReactKeyboardEvent } from "react"
import { Clock } from "@/components/clock"
import { VolumeControl } from "@/components/volume-control"
import { useWindowStore } from "@/store/window-store"
import { useAuthState } from "@/hooks/use-auth-state"
import { useDesktopServiceStore } from "@/store/desktop-service-store"
import { useCreditsManager } from "@/hooks/use-credits-manager"
import {
  appDefinitions,
  getAIApps,
  getFinancialApps,
  getSystemApps,
  getToolApps,
  type AppDefinition,
} from "@/lib/app-definitions"
import { TYPOGRAPHY_TOKENS } from "@/lib/design-tokens"
import { cn } from "@/lib/utils"

const categoryMenus = [
  { id: "ai", emoji: "🤖", apps: () => getAIApps() },
  { id: "financial", emoji: "💰", apps: () => getFinancialApps() },
  { id: "tools", emoji: "🔧", apps: () => getToolApps() },
]

const topLevelMenuOrder: string[] = ["apple", ...categoryMenus.map((menu) => menu.id)]

export function MenuBar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const { addWindow, focusWindow, windows } = useWindowStore()
  const { selectedServiceId, isDesktopModeEnabled } = useDesktopServiceStore()
  const { user, loading } = useAuthState()
  const { credits, canClaim, isClaiming, timeToNextClaim, claimDailyCredits } = useCreditsManager()
  const menuRef = useRef<HTMLDivElement>(null)
  const menuButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const menuItemRefs = useRef<Record<string, Array<HTMLButtonElement | null>>>({})

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveMenu(null)
      }
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [])

  useEffect(() => {
    if (activeMenu) {
      requestAnimationFrame(() => {
        const firstInteractive = menuItemRefs.current[activeMenu]?.find((item) => item)
        firstInteractive?.focus()
      })
    }
  }, [activeMenu])

  const registerMenuButton = useCallback(
    (menuId: string) => (node: HTMLButtonElement | null) => {
      menuButtonRefs.current[menuId] = node
    },
    [],
  )

  const registerMenuItem = useCallback(
    (menuId: string, index: number) => (node: HTMLButtonElement | null) => {
      if (!menuItemRefs.current[menuId]) {
        menuItemRefs.current[menuId] = []
      }
      menuItemRefs.current[menuId][index] = node
    },
    [],
  )

  const focusMenuButton = useCallback((menuId: string) => {
    const button = menuButtonRefs.current[menuId]
    button?.focus()
  }, [])

  const focusMenuItem = useCallback((menuId: string, index: number) => {
    const item = menuItemRefs.current[menuId]?.[index]
    item?.focus()
  }, [])

  const getSiblingMenuId = useCallback((menuId: string, direction: 1 | -1) => {
    const currentIndex = topLevelMenuOrder.indexOf(menuId)
    if (currentIndex === -1) return null
    const nextIndex = (currentIndex + direction + topLevelMenuOrder.length) % topLevelMenuOrder.length
    return topLevelMenuOrder[nextIndex]
  }, [])

  const handleMenuButtonKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement>, menuId: string) => {
      if (event.key === "ArrowRight") {
        event.preventDefault()
        const sibling = getSiblingMenuId(menuId, 1)
        if (sibling) {
          setActiveMenu(null)
          focusMenuButton(sibling)
        }
        return
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault()
        const sibling = getSiblingMenuId(menuId, -1)
        if (sibling) {
          setActiveMenu(null)
          focusMenuButton(sibling)
        }
        return
      }

      if (event.key === "ArrowDown") {
        event.preventDefault()
        setActiveMenu(menuId)
        return
      }

      if (event.key === "ArrowUp") {
        event.preventDefault()
        setActiveMenu(menuId)
        requestAnimationFrame(() => {
          const items = menuItemRefs.current[menuId]?.filter(Boolean) ?? []
          if (items.length > 0) {
            focusMenuItem(menuId, items.length - 1)
          }
        })
        return
      }

      if (event.key === "Escape") {
        event.preventDefault()
        setActiveMenu(null)
        focusMenuButton(menuId)
      }
    },
    [focusMenuButton, focusMenuItem, getSiblingMenuId],
  )

  const handleMenuItemKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement>, menuId: string, index: number, total: number) => {
      if (event.key === "ArrowDown") {
        event.preventDefault()
        const nextIndex = (index + 1) % total
        focusMenuItem(menuId, nextIndex)
        return
      }

      if (event.key === "ArrowUp") {
        event.preventDefault()
        const prevIndex = (index - 1 + total) % total
        focusMenuItem(menuId, prevIndex)
        return
      }

      if (event.key === "Home") {
        event.preventDefault()
        focusMenuItem(menuId, 0)
        return
      }

      if (event.key === "End") {
        event.preventDefault()
        focusMenuItem(menuId, total - 1)
        return
      }

      if (event.key === "Escape") {
        event.preventDefault()
        setActiveMenu(null)
        focusMenuButton(menuId)
        return
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault()
        const direction = event.key === "ArrowRight" ? 1 : -1
        const sibling = getSiblingMenuId(menuId, direction)
        if (sibling) {
          setActiveMenu(sibling)
          requestAnimationFrame(() => {
            const items = menuItemRefs.current[sibling]?.filter(Boolean) ?? []
            if (items.length > 0) {
              focusMenuItem(sibling, 0)
            } else {
              focusMenuButton(sibling)
            }
          })
        }
      }
    },
    [focusMenuButton, focusMenuItem, getSiblingMenuId],
  )

  const openAppWindow = (appId: string) => {
    const appDef = appDefinitions.find((app) => app.id === appId)
    if (!appDef) return

    const existingWindow = windows.find((w) => w.id === appId)
    if (existingWindow && !existingWindow.minimized) {
      focusWindow(appId)
    } else {
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const menuBarHeight = 28

      const size = {
        width: Math.min(appDef.defaultWidth, viewportWidth - 100),
        height: Math.min(appDef.defaultHeight, viewportHeight - menuBarHeight - 100),
      }
      const position = {
        x: Math.max(50, (viewportWidth - size.width) / 2),
        y: Math.max(menuBarHeight + 50, (viewportHeight - size.height) / 2),
      }

      addWindow({
        id: appId,
        title: appDef.title,
        x: existingWindow?.x ?? position.x,
        y: existingWindow?.y ?? position.y,
        width: size.width,
        height: size.height,
        minimized: false,
      })
    }
    setActiveMenu(null)
  }

  const handleMenuToggle = useCallback((menuName: string) => {
    setActiveMenu((prev) => (prev === menuName ? null : menuName))
  }, [])

  const handleLoginClick = () => {
    openAppWindow("supabase-login")
  }

  const filterAppsForMenu = (apps: AppDefinition[]) => {
    if (!isDesktopModeEnabled) {
      return apps
    }

    return apps.filter((app) => app.id !== selectedServiceId)
  }

  const systemApps = filterAppsForMenu(getSystemApps())
  const categorizedMenus = categoryMenus.map((menu) => ({
    ...menu,
    apps: filterAppsForMenu(menu.apps()),
  }))

  return (
    <div
      ref={menuRef}
      className={cn(
        "fixed inset-x-0 top-0 z-30 flex h-9 items-center justify-between border-b border-border bg-background px-2 font-semibold sm:h-7",
        TYPOGRAPHY_TOKENS.caption,
        "text-foreground",
      )}
    >
      {/* Left side - Menu items */}
      <div className="flex items-center space-x-0" role="menubar" aria-label="Application menu">
        {/* Apple Menu */}
        <div className="relative">
          <button
            id="menu-button-apple"
            ref={registerMenuButton("apple")}
            className="rounded-md px-2 py-1 transition-colors hover:bg-hover-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            role="menuitem"
            aria-haspopup="true"
            aria-expanded={activeMenu === "apple"}
            aria-controls="menu-panel-apple"
            onClick={() => handleMenuToggle("apple")}
            onKeyDown={(event) => handleMenuButtonKeyDown(event, "apple")}
          >
            🍎
          </button>
          {activeMenu === "apple" && (
            <div
              id="menu-panel-apple"
              role="menu"
              aria-labelledby="menu-button-apple"
              className="absolute top-full left-0 z-40 min-w-48 rounded-md border border-border/60 bg-card shadow-sm"
            >
              {systemApps.map((app, index) => (
                <button
                  key={app.id}
                  ref={registerMenuItem("apple", index)}
                  role="menuitem"
                  className="block w-full border-b border-border/60 px-3 py-2 text-left text-foreground transition-colors hover:bg-hover-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 last:border-b-0"
                  onClick={() => openAppWindow(app.id)}
                  onKeyDown={(event) => handleMenuItemKeyDown(event, "apple", index, systemApps.length)}
                >
                  {app.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category Menus */}
        {categorizedMenus.map((menu) => (
          <div key={menu.id} className="relative">
            <button
              id={`menu-button-${menu.id}`}
              ref={registerMenuButton(menu.id)}
              className="rounded-md px-2 py-1 transition-colors hover:bg-hover-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              role="menuitem"
              aria-haspopup="true"
              aria-expanded={activeMenu === menu.id}
              aria-controls={`menu-panel-${menu.id}`}
              onClick={() => handleMenuToggle(menu.id)}
              onKeyDown={(event) => handleMenuButtonKeyDown(event, menu.id)}
            >
              {menu.emoji}
            </button>
            {activeMenu === menu.id && (
              <div
                id={`menu-panel-${menu.id}`}
                role="menu"
                aria-labelledby={`menu-button-${menu.id}`}
                className="absolute top-full left-0 z-40 min-w-48 rounded-md border border-border/60 bg-card shadow-sm"
              >
                {menu.apps.map((app, index) => (
                  <button
                    key={app.id}
                    ref={registerMenuItem(menu.id, index)}
                    role="menuitem"
                    className="block w-full border-b border-border/60 px-3 py-2 text-left text-foreground transition-colors hover:bg-hover-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 last:border-b-0"
                    onClick={() => {
                      if (app.requiresAuth && !user) {
                        openAppWindow("supabase-login")
                      } else {
                        openAppWindow(app.id)
                      }
                    }}
                    onKeyDown={(event) => handleMenuItemKeyDown(event, menu.id, index, menu.apps.length)}
                  >
                    {app.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right side - System controls */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        {user && (
          <button
            onClick={() => void claimDailyCredits()}
            disabled={!canClaim || isClaiming}
            className={`hidden items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors sm:flex ${
              canClaim
                ? "border-primary/50 bg-primary/10 text-primary hover:bg-primary/20"
                : "border-border/60 bg-muted/60 text-muted-foreground"
            }`}
          >
            {canClaim
              ? isClaiming
                ? "Claiming..."
                : `Claim +${credits?.daily_credit_amount ?? 50}`
              : `${credits?.total_credits ?? 0} credits`}
          </button>
        )}

        {!canClaim && user && timeToNextClaim && (
          <span className="hidden text-[10px] text-muted-foreground sm:block">
            Refresh in {timeToNextClaim}
          </span>
        )}

        <VolumeControl />

        {/* Login Button */}
        <button
          onClick={handleLoginClick}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            user
              ? "bg-emerald-500 text-white hover:bg-emerald-600"
              : "border border-border/60 bg-card/70 text-foreground hover:border-primary/50 hover:text-primary"
          }`}
          style={{ touchAction: "manipulation" }}
          disabled={loading}
        >
          {loading ? "..." : user ? user.email : "Login"}
        </button>

        <Clock />
      </div>
    </div>
  )
}
