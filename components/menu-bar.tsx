"use client"

import { useState, useRef, useEffect } from "react"
import { Clock } from "@/components/clock"
import { VolumeControl } from "@/components/volume-control"
import { useWindowStore } from "@/store/window-store"
import { useAuthState } from "@/hooks/use-auth-state"
import { appDefinitions, getAIApps, getFinancialApps, getSystemApps, getToolApps } from "@/lib/app-definitions"

const categoryMenus = [
  { id: "ai", emoji: "🤖", apps: () => getAIApps() },
  { id: "financial", emoji: "💰", apps: () => getFinancialApps() },
  { id: "tools", emoji: "🔧", apps: () => getToolApps() },
]

export function MenuBar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const { addWindow, focusWindow, windows } = useWindowStore()
  const { user, loading } = useAuthState()
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

  return (
    <div
      ref={menuRef}
      className="fixed top-0 left-0 right-0 h-9 sm:h-7 bg-white border-b border-black flex items-center justify-between px-2 text-xs font-bold z-30"
      style={{ fontFamily: "Chicago, monospace" }}
    >
      {/* Left side - Menu items */}
      <div className="flex items-center space-x-0">
        {/* Apple Menu */}
        <div className="relative">
          <button
            className="px-2 py-1 hover:bg-blue-500 hover:text-white"
            onClick={() => handleMenuClick("apple")}
          >
            🍎
          </button>
          {activeMenu === "apple" && (
            <div className="absolute top-full left-0 bg-white border border-black shadow-lg min-w-48 z-40">
              {getSystemApps().map((app) => (
                <button
                  key={app.id}
                  className="block w-full text-left px-3 py-2 hover:bg-blue-500 hover:text-white border-b border-gray-200 last:border-b-0"
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
              className="px-2 py-1 hover:bg-blue-500 hover:text-white"
              onClick={() => handleMenuClick(menu.id)}
            >
              {menu.emoji}
            </button>
            {activeMenu === menu.id && (
              <div className="absolute top-full left-0 bg-white border border-black shadow-lg min-w-48 z-40">
                {menu.apps().map((app) => (
                  <button
                    key={app.id}
                    className="block w-full text-left px-3 py-2 hover:bg-blue-500 hover:text-white border-b border-gray-200 last:border-b-0"
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
        <VolumeControl />

        {/* Login Button */}
        <button
          onClick={handleLoginClick}
          className={`px-2 py-1 text-xs font-bold transition-colors ${
            user ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-200 hover:bg-gray-300"
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
