"use client"

import type React from "react"
import { useEffect, useState, Suspense } from "react"
import { DesktopIcon } from "@/components/desktop-icon"
import { MenuBar } from "@/components/menu-bar"
import { ThemeSwitcher } from "@/components/theme-manager"
import { createClient } from "@/lib/supabase-client"
import { User, AuthChangeEvent, Session } from "@supabase/supabase-js"
import { logger } from "@/lib/logger"
import { cn } from "@/lib/utils"
import { ErrorBoundary } from "@/components/error-boundary"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// Import all components
import { SupabaseLoginApp } from "@/components/supabase-login-app"
import { CsvParserApp } from "@/components/csv-parser-app"
import { CategoryLineChart } from "@/components/category-line-chart"
import { PaymentSourceBalances } from "@/components/payment-source-balances"
import { TransactionManager } from "@/components/transaction-manager"
import { AIChatConsole } from "@/components/ai-chat-console"
import { CreditsManager } from "@/components/credits-manager"
import { ServiceApp } from "@/components/service-app"
import { DebugConsole } from "@/components/debug-console"
import { AboutThisDesktopApp } from "@/components/about-this-desktop-app"
import { WindowFrame } from "@/components/window-frame" // Keep this import
import { useWindowStore, WindowState, WindowStore } from "@/store/window-store" // Import WindowState, WindowStore and useWindowStore

import { appDefinitions, type AppId, getFinancialApps, getAIApps, getSystemApps, getToolApps } from "@/lib/app-definitions"

// Remove the local WindowState interface, as it's now imported from window-store.ts
// interface WindowState {
//   id: AppId
//   isOpen: boolean
//   isMinimized: boolean
//   zIndex: number
//   position: { x: number; y: number }
//   size: { width: number; height: number }
// }

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Use the useWindowStore
  const windows = useWindowStore((state: WindowStore) => state.windows)
  const addWindow = useWindowStore((state: WindowStore) => state.addWindow)
  const removeWindow = useWindowStore((state: WindowStore) => state.removeWindow)
  const updateWindow = useWindowStore((state: WindowStore) => state.updateWindow)
  const focusWindow = useWindowStore((state: WindowStore) => state.focusWindow)
  const activeWindowId = useWindowStore((state: WindowStore) => state.activeWindowId) // To highlight active window in taskbar

  useEffect(() => {
    const supabase = createClient()
    let unsubscribe: (() => void) | undefined
    if (supabase) {
      supabase.auth.getUser()
        .then(({ data: { user } }: { data: { user: User | null } }) => {
          setUser(user)
        })
        .finally(() => setIsLoading(false))

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null)
      })
      unsubscribe = () => subscription.unsubscribe()
    } else {
      logger.warn("HomePage", "Supabase client not available - authentication features will be disabled")
      setUser(null)
      setIsLoading(false)
    }
    return () => unsubscribe?.()
  }, [])

  const openWindow = (appId: AppId) => {
    const appDef = appDefinitions.find(app => app.id === appId)
    if (!appDef) return

    // Use addWindow from the store, it handles existing window, minimizing, and z-index
    addWindow({
      id: appId,
      title: appDef.title,
      x: 50 + (windows.length * 30), // Initial position, can be refined in store if preferred
      y: 50 + (windows.length * 30),
      width: appDef.defaultWidth,
      height: appDef.defaultHeight,
      minimized: false, // addWindow sets this, but providing for clarity
    })
  }

  // These functions now just call the store actions
  const closeWindow = (appId: AppId) => {
    removeWindow(appId)
  }

  const minimizeWindow = (appId: AppId) => {
    updateWindow(appId, { minimized: true })
  }

  const bringToFront = (appId: AppId) => {
    focusWindow(appId)
  }

  // Remove these as they are handled by useWindowManager and updateWindow
  // const updateWindowPosition = (appId: AppId, position: { x: number; y: number }) => {
  //   setWindows(prev => prev.map(w =>
  //     w.id === appId ? { ...w, position } : w
  //   ))
  // }

  // const updateWindowSize = (appId: AppId, size: { width: number; height: number }) => {
  //   setWindows(prev => prev.map(w =>
  //     w.id === appId ? { ...w, size } : w
  //   ))
  // }

  const renderAppContent = (appId: AppId) => {
    const contentMap = {
      "supabase-login": () => <SupabaseLoginApp />,
      "csv-parser": () => <CsvParserApp />,
      "category-line-chart": () => <CategoryLineChart />,
      "payment-source-balances": () => <PaymentSourceBalances />,
      "transaction-manager": () => <TransactionManager />,
      "ai-chat-console": () => <AIChatConsole />,
      "credits-manager": () => <CreditsManager />,
      "service-app": () => <ServiceApp serviceName="Default Service" />,
      "debug-console": () => <DebugConsole />,
      "about-this-desktop": () => <AboutThisDesktopApp />,
    }

    const Component = contentMap[appId as keyof typeof contentMap]
    return Component ? (
      <ErrorBoundary fallback={<div className="p-4 text-destructive">Failed to load {appId}</div>}>
        <Suspense fallback={<LoadingSpinner />}> 
          <Component />
        </Suspense>
      </ErrorBoundary>
    ) : (
      <div className="p-4 text-muted-foreground">App not found</div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
      <div className="h-screen w-screen overflow-hidden bg-background relative">
        {/* Menu Bar */}
        <MenuBar />

        {/* Desktop Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />

        {/* Desktop Icons */}
        <div className="absolute inset-0 p-4 pt-16 z-base">
          <div className="grid grid-cols-1 gap-6 w-fit">
            {/* AI & Communication Section */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground/80 px-2 flex items-center gap-2">
                <span className="text-lg">🤖</span>
                AI Assistant
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {getAIApps().map(app => (
                  <div key={app.id}>
                    <DesktopIcon
                      id={app.id}
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
                  </div>
                ))}
              </div>
            </section>

            {/* Financial Apps Section */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground/80 px-2 flex items-center gap-2">
                <span className="text-lg">💰</span>
                Financial Management
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {getFinancialApps().map(app => (
                  <div key={app.id}>
                    <DesktopIcon
                      id={app.id}
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
                  </div>
                ))}
              </div>
            </section>

            {/* Tools Section */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground/80 px-2 flex items-center gap-2">
                <span className="text-lg">🔧</span>
                Tools
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {getToolApps().map(app => (
                  <div key={app.id}>
                    <DesktopIcon
                      id={app.id}
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
                  </div>
                ))}
              </div>
            </section>

            {/* System Apps Section */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground/80 px-2 flex items-center gap-2">
                <span className="text-lg">⚙️</span>
                System
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {getSystemApps().map(app => (
                  <div key={app.id}>
                    <DesktopIcon
                      id={app.id}
                      title={app.title}
                      onClick={() => openWindow(app.id)}
                      icon={`/images/${app.id}.png`}
                    />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Windows */}
        {windows.map((win: WindowState) => {
          // WindowFrame handles the minimized state internally, so just return null if minimized
          // if (!win.isOpen || win.isMinimized) return null // `isOpen` is no longer a property on WindowState from the store
          if (win.minimized) return null
          
          const appDef = appDefinitions.find(app => app.id === (win.id as AppId))
          if (!appDef) return null

          return (
            <div key={win.id}>
              <WindowFrame
                id={win.id}
                title={appDef.title}
                x={win.x}
                y={win.y}
                width={win.width}
                height={win.height}
                minimized={win.minimized}
                zIndex={win.zIndex}
              >
                {renderAppContent(win.id as AppId)}
              </WindowFrame>
            </div>
            // Remove the manual window div with all the event handlers
            // <div
            //   key={win.id}
            //   className="absolute bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            //   style={{
            //     left: win.position.x,
            //     top: win.position.y,
            //     width: win.size.width,
            //     height: win.size.height,
            //     zIndex: win.zIndex,
            //   }}
            //   onClick={() => bringToFront(win.id)}
            // >
            //   {/* Window Header */}
            //   <div 
            //     className="bg-gray-100 dark:bg-gray-700 px-4 py-2 flex items-center justify-between cursor-move border-b border-gray-200 dark:border-gray-600"
            //     onMouseDown={(e) => {
            //       const startX = e.clientX - win.position.x
            //       const startY = e.clientY - win.position.y

            //       const handleMouseMove = (e: MouseEvent) => {
            //         updateWindowPosition(win.id, {
            //           x: e.clientX - startX,
            //           y: e.clientY - startY,
            //         })
            //       }

            //       const handleMouseUp = () => {
            //         document.removeEventListener('mousemove', handleMouseMove)
            //         document.removeEventListener('mouseup', handleMouseUp)
            //       }

            //       document.addEventListener('mousemove', handleMouseMove)
            //       document.addEventListener('mouseup', handleMouseUp)
            //     }}
            //   >
            //     <div className="flex items-center gap-2">
            //       <img 
            //         src={`/images/${win.id}.png`} 
            //         alt={appDef.title}
            //         className="w-4 h-4"
            //         onError={(e) => {
            //           e.currentTarget.style.display = 'none'
            //         }}
            //       />
            //       <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            //         {appDef.title}
            //       </span>
            //     </div>
            //     <div className="flex items-center gap-1">
            //       <button
            //         onClick={() => minimizeWindow(win.id)}
            //         className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600"
            //       />
            //       <button
            //         onClick={() => closeWindow(win.id)}
            //         className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600"
            //       />
            //     </div>
            //   </div>

            //   {/* Window Content */}
            //   <div className="h-full overflow-auto">
            //     {renderAppContent(win.id)}
            //   </div>

            //   {/* Resize Handle */}
            //   <div
            //     className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-gray-300 dark:bg-gray-600"
            //     onMouseDown={(e) => {
            //       e.stopPropagation()
            //       const startX = e.clientX
            //       const startY = e.clientY
            //       const startWidth = win.size.width
            //       const startHeight = win.size.height

            //       const handleMouseMove = (e: MouseEvent) => {
            //         const newWidth = Math.max(300, startWidth + (e.clientX - startX))
            //         const newHeight = Math.max(200, startHeight + (e.clientY - startY))
            //         updateWindowSize(win.id, { width: newWidth, height: newHeight })
            //       }

            //       const handleMouseUp = () => {
            //         document.removeEventListener('mousemove', handleMouseMove)
            //         document.removeEventListener('mouseup', handleMouseUp)
            //       }

            //       document.addEventListener('mousemove', handleMouseMove)
            //       document.addEventListener('mouseup', handleMouseUp)
            //     }}
            //   />
            // </div>
          )
        })}

        {/* Enhanced Taskbar */}
        <div className="absolute bottom-0 left-0 right-0 glass border-t z-docked">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-2 overflow-x-auto">
              {windows.filter((w: WindowState) => !w.minimized).map((win: WindowState) => { // Filter for open and non-minimized windows
                const appDef = appDefinitions.find(app => app.id === (win.id as AppId))
                if (!appDef) return null

                return (
                  <button
                    key={win.id}
                    onClick={() => focusWindow(win.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      activeWindowId === win.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/50 text-muted-foreground"
                    )}
                  >
                    <img 
                      src={`/images/${win.id}.png`} 
                      alt=""
                      className="w-4 h-4"
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <span className="truncate max-w-32">{appDef.title}</span>
                  </button>
                )
              })}
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
              {user && (
                <div className="text-sm text-muted-foreground">
                  Welcome, <span className="font-medium">{user.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  )
}

