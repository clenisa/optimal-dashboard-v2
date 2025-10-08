"use client"

import { useState, useRef, useEffect } from "react"
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

const categoryMenus = [
  { id: "ai", emoji: "🤖", apps: () => getAIApps() },
  { id: "financial", emoji: "💰", apps: () => getFinancialApps() },
  { id: "tools", emoji: "🔧", apps: () => getToolApps() },
]

export function MenuBar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const { addWindow, focusWindow, windows } = useWindowStore()
  const { selectedServiceId, isDesktopModeEnabled } = useDesktopServiceStore()
  const { user, loading } = useAuthState()
  const { credits, canClaim, isClaiming, timeToNextClaim, claimDailyCredits } = useCreditsManager()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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

  const handleMenuClick = (menuName: string) => {
    setActiveMenu(activeMenu === menuName ? null : menuName)
  }

  const handleLoginClick = () => {
    openAppWindow("supabase-login")
  }

  const filterAppsForMenu = (apps: AppDefinition[]) => {
    if (!isDesktopModeEnabled) {
      return apps
    }

    return apps.filter((app) => app.id !== selectedServiceId)
  }

  return (
    <div
      ref={menuRef}
      className="fixed top-0 left-0 right-0 h-9 sm:h-7 bg-background border-b border-border flex items-center justify-between px-2 text-xs font-bold z-30"
      style={{ fontFamily: "Chicago, monospace" }}
    >
      {/* Left side - Menu items */}
      <div className="flex items-center space-x-0">
        {/* Apple Menu */}
        <div className="relative">
          <button
            className="px-2 py-1 transition-colors hover:bg-primary/20 hover:text-primary"
            onClick={() => handleMenuClick("apple")}
          >
            🍎
          </button>
          {activeMenu === "apple" && (
            <div className="absolute top-full left-0 z-40 min-w-48 border border-border bg-card shadow-lg">
              {filterAppsForMenu(getSystemApps()).map((app) => (
                <button
                  key={app.id}
                  className="block w-full border-b border-border px-3 py-2 text-left text-foreground transition-colors hover:bg-accent hover:text-accent-foreground last:border-b-0"
                  onClick={() => openAppWindow(app.id)}
                >
                  {app.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category Menus */}
        {categoryMenus.map((menu) => (
          <div key={menu.id} className="relative">
            <button
              className="px-2 py-1 transition-colors hover:bg-primary/20 hover:text-primary"
              onClick={() => handleMenuClick(menu.id)}
            >
              {menu.emoji}
            </button>
            {activeMenu === menu.id && (
              <div className="absolute top-full left-0 z-40 min-w-48 border border-border bg-card shadow-lg">
                {filterAppsForMenu(menu.apps()).map((app) => (
                  <button
                    key={app.id}
                    className="block w-full border-b border-border px-3 py-2 text-left text-foreground transition-colors hover:bg-accent hover:text-accent-foreground last:border-b-0"
                    onClick={() => {
                      if (app.requiresAuth && !user) {
                        openAppWindow("supabase-login")
                      } else {
                        openAppWindow(app.id)
                      }
                    }}
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
      <div className="flex items-center space-x-2">
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
