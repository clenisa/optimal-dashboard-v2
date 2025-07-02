"use client"

import { useEffect, useState } from "react"
import { DesktopIcon } from "@/components/desktop-icon"
import { MenuBar } from "@/components/menu-bar"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { createClient } from "@/lib/supabase-client"
import { User } from "@supabase/supabase-js"

// Import all components
import { SupabaseLoginApp } from "@/components/supabase-login-app"
import { CsvParserApp } from "@/components/csv-parser-app"
import { CategoryLineChart } from "@/components/category-line-chart"
import { PaymentSourceBalances } from "@/components/payment-source-balances"
import { AIChatConsole } from "@/components/ai-chat-console"
import { CreditsManager } from "@/components/credits-manager"
import { ServiceApp } from "@/components/service-app"
import { DebugConsole } from "@/components/debug-console"
import { AboutThisDesktopApp } from "@/components/about-this-desktop-app"

import { appDefinitions, type AppId, getFinancialApps, getAIApps, getSystemApps, getToolApps } from "@/lib/app-definitions"

interface WindowState {
  id: AppId
  isOpen: boolean
  isMinimized: boolean
  zIndex: number
  position: { x: number; y: number }
  size: { width: number; height: number }
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [windows, setWindows] = useState<WindowState[]>([])
  const [highestZIndex, setHighestZIndex] = useState(20)

  useEffect(() => {
    const supabase = createClient()
    if (supabase) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user)
      })

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
      })

      return () => subscription.unsubscribe()
    }
  }, [])

  const openWindow = (appId: AppId) => {
    const existingWindow = windows.find(w => w.id === appId)
    if (existingWindow) {
      if (existingWindow.isMinimized) {
        setWindows(prev => prev.map(w => 
          w.id === appId ? { ...w, isMinimized: false, zIndex: highestZIndex + 1 } : w
        ))
        setHighestZIndex(prev => prev + 1)
      } else {
        bringToFront(appId)
      }
      return
    }

    const appDef = appDefinitions.find(app => app.id === appId)
    if (!appDef) return

    const newWindow: WindowState = {
      id: appId,
      isOpen: true,
      isMinimized: false,
      zIndex: highestZIndex + 1,
      position: { 
        x: 50 + (windows.length * 30), 
        y: 50 + (windows.length * 30) 
      },
      size: { 
        width: appDef.defaultWidth, 
        height: appDef.defaultHeight 
      }
    }

    setWindows(prev => [...prev, newWindow])
    setHighestZIndex(prev => prev + 1)
  }

  const closeWindow = (appId: AppId) => {
    setWindows(prev => prev.filter(w => w.id !== appId))
  }

  const minimizeWindow = (appId: AppId) => {
    setWindows(prev => prev.map(w => 
      w.id === appId ? { ...w, isMinimized: true } : w
    ))
  }

  const bringToFront = (appId: AppId) => {
    setWindows(prev => prev.map(w => 
      w.id === appId ? { ...w, zIndex: highestZIndex + 1 } : w
    ))
    setHighestZIndex(prev => prev + 1)
  }

  const updateWindowPosition = (appId: AppId, position: { x: number; y: number }) => {
    setWindows(prev => prev.map(w => 
      w.id === appId ? { ...w, position } : w
    ))
  }

  const updateWindowSize = (appId: AppId, size: { width: number; height: number }) => {
    setWindows(prev => prev.map(w => 
      w.id === appId ? { ...w, size } : w
    ))
  }

  const renderAppContent = (appId: AppId) => {
    switch (appId) {
      case "supabase-login":
        return <SupabaseLoginApp />
      case "csv-parser":
        return <CsvParserApp />
      case "category-line-chart":
        return <CategoryLineChart />
      case "payment-source-balances":
        return <PaymentSourceBalances />
      case "ai-chat-console":
        return <AIChatConsole />
      case "credits-manager":
        return <CreditsManager />
      case "service-app":
        return <ServiceApp />
      case "debug-console":
        return <DebugConsole />
      case "about-this-desktop":
        return <AboutThisDesktopApp />
      default:
        return <div>App not found</div>
    }
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 relative">
        {/* Menu Bar */}
        <MenuBar />

        {/* Desktop Icons */}
        <div className="absolute inset-0 p-4 pt-16">
          <div className="grid grid-cols-1 gap-4 w-fit">
            {/* AI & Communication Section */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-2">
                🤖 AI Assistant
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {getAIApps().map(app => (
                  <DesktopIcon
                    key={app.id}
                    title={app.title}
                    onClick={() => {
                      if (app.requiresAuth && !user) {
                        openWindow("supabase-login")
                      } else {
                        openWindow(app.id)
                      }
                    }}
                    icon={`/images/${app.id}.png`}
                  />
                ))}
              </div>
            </div>

            {/* Financial Apps Section */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-2">
                💰 Financial Management
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {getFinancialApps().map(app => (
                  <DesktopIcon
                    key={app.id}
                    title={app.title}
                    onClick={() => {
                      if (app.requiresAuth && !user) {
                        openWindow("supabase-login")
                      } else {
                        openWindow(app.id)
                      }
                    }}
                    icon={`/images/${app.id}.png`}
                  />
                ))}
              </div>
            </div>

            {/* Tools Section */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-2">
                🔧 Tools
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {getToolApps().map(app => (
                  <DesktopIcon
                    key={app.id}
                    title={app.title}
                    onClick={() => {
                      if (app.requiresAuth && !user) {
                        openWindow("supabase-login")
                      } else {
                        openWindow(app.id)
                      }
                    }}
                    icon={`/images/${app.id}.png`}
                  />
                ))}
              </div>
            </div>

            {/* System Apps Section */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-2">
                ⚙️ System
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {getSystemApps().map(app => (
                  <DesktopIcon
                    key={app.id}
                    title={app.title}
                    onClick={() => openWindow(app.id)}
                    icon={`/images/${app.id}.png`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Windows */}
        {windows.map(win => {
          if (!win.isOpen || win.isMinimized) return null
          
          const appDef = appDefinitions.find(app => app.id === win.id)
          if (!appDef) return null

          return (
            <div
              key={win.id}
              className="absolute bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              style={{
                left: win.position.x,
                top: win.position.y,
                width: win.size.width,
                height: win.size.height,
                zIndex: win.zIndex,
              }}
              onClick={() => bringToFront(win.id)}
            >
              {/* Window Header */}
              <div 
                className="bg-gray-100 dark:bg-gray-700 px-4 py-2 flex items-center justify-between cursor-move border-b border-gray-200 dark:border-gray-600"
                onMouseDown={(e) => {
                  const startX = e.clientX - win.position.x
                  const startY = e.clientY - win.position.y

                  const handleMouseMove = (e: MouseEvent) => {
                    updateWindowPosition(win.id, {
                      x: e.clientX - startX,
                      y: e.clientY - startY,
                    })
                  }

                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove)
                    document.removeEventListener('mouseup', handleMouseUp)
                  }

                  document.addEventListener('mousemove', handleMouseMove)
                  document.addEventListener('mouseup', handleMouseUp)
                }}
              >
                <div className="flex items-center gap-2">
                  <img 
                    src={`/images/${win.id}.png`} 
                    alt={appDef.title}
                    className="w-4 h-4"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {appDef.title}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => minimizeWindow(win.id)}
                    className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600"
                  />
                  <button
                    onClick={() => closeWindow(win.id)}
                    className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600"
                  />
                </div>
              </div>

              {/* Window Content */}
              <div className="h-full overflow-auto">
                {renderAppContent(win.id)}
              </div>

              {/* Resize Handle */}
              <div
                className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-gray-300 dark:bg-gray-600"
                onMouseDown={(e) => {
                  e.stopPropagation()
                  const startX = e.clientX
                  const startY = e.clientY
                  const startWidth = win.size.width
                  const startHeight = win.size.height

                  const handleMouseMove = (e: MouseEvent) => {
                    const newWidth = Math.max(300, startWidth + (e.clientX - startX))
                    const newHeight = Math.max(200, startHeight + (e.clientY - startY))
                    updateWindowSize(win.id, { width: newWidth, height: newHeight })
                  }

                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove)
                    document.removeEventListener('mouseup', handleMouseUp)
                  }

                  document.addEventListener('mousemove', handleMouseMove)
                  document.addEventListener('mouseup', handleMouseUp)
                }}
              />
            </div>
          )
        })}

        {/* Taskbar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 px-4 py-2 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {windows.filter(w => w.isOpen).map(win => {
                const appDef = appDefinitions.find(app => app.id === win.id)
                if (!appDef) return null

                return (
                  <button
                    key={win.id}
                    onClick={() => {
                      if (win.isMinimized) {
                        setWindows(prev => prev.map(w => 
                          w.id === win.id ? { ...w, isMinimized: false, zIndex: highestZIndex + 1 } : w
                        ))
                        setHighestZIndex(prev => prev + 1)
                      } else {
                        bringToFront(win.id)
                      }
                    }}
                    className={`px-3 py-1 rounded text-sm flex items-center gap-2 ${
                      win.isMinimized 
                        ? 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400' 
                        : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                    }`}
                  >
                    <img 
                      src={`/images/${win.id}.png`} 
                      alt={appDef.title}
                      className="w-4 h-4"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    {appDef.title}
                  </button>
                )
              })}
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
              {user && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome, {user.email}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

