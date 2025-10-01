"use client"

import { useEffect, useState } from "react"
import { MenuBar } from "@/components/menu-bar"
import { ThemeProvider } from "@/components/theme-manager"
import { ThemeSwitcher } from "@/components/theme-manager"
import { createClient } from "@/lib/supabase-client"
import { User, AuthChangeEvent, Session } from "@supabase/supabase-js"
import { logger } from "@/lib/logger"

// Import all components
import { SupabaseLoginApp } from "@/components/supabase-login-app"
import { CsvParserApp } from "@/components/csv-parser-app"
import { CsvCombinerApp } from "@/components/csv-combiner-app"
import { CategoryLineChart } from "@/components/category-line-chart"
import { PaymentSourceBalances } from "@/components/payment-source-balances"
import { TransactionManager } from "@/components/transaction-manager"
import { MortgageCalculatorApp } from "@/components/mortgage-calculator-app"
import { AIChatConsole } from "@/components/ai-chat-console"
import { CreditsManager } from "@/components/credits-manager"
import { ServiceApp } from "@/components/service-app"
import { DebugConsole } from "@/components/debug-console"
import { AboutThisDesktopApp } from "@/components/about-this-desktop-app"
import { DesktopServiceSettings } from "@/components/desktop-service-settings"
import { WindowFrame } from "@/components/window-frame"
import { useWindowStore, type WindowState, type WindowStore } from "@/store/window-store"
import { useDesktopServiceStore } from "@/store/desktop-service-store"

import { appDefinitions, type AppId } from "@/lib/app-definitions"

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
  // Remove local window state management
  // const [windows, setWindows] = useState<WindowState[]>([])
  // const [highestZIndex, setHighestZIndex] = useState(20)

  // Use the useWindowStore
  const windows = useWindowStore((state: WindowStore) => state.windows)
  const addWindow = useWindowStore((state: WindowStore) => state.addWindow)
  const removeWindow = useWindowStore((state: WindowStore) => state.removeWindow)
  const updateWindow = useWindowStore((state: WindowStore) => state.updateWindow)
  const focusWindow = useWindowStore((state: WindowStore) => state.focusWindow)
  const activeWindowId = useWindowStore((state: WindowStore) => state.activeWindowId)

  const { selectedServiceId, isDesktopModeEnabled } = useDesktopServiceStore()

  useEffect(() => {
    const supabase = createClient()
    if (supabase) {
      supabase.auth.getUser().then(({ data: { user } }: { data: { user: User | null } }) => {
        setUser(user)
      })

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null)
      })

      return () => subscription.unsubscribe()
    } else {
      logger.warn("HomePage", "Supabase client not available - authentication features will be disabled")
      setUser(null)
    }
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
    switch (appId) {
      case "supabase-login":
        return <SupabaseLoginApp />
      case "csv-parser":
        return <CsvParserApp />
      case "csv-combiner":
        return <CsvCombinerApp />
      case "category-line-chart":
        return <CategoryLineChart />
      case "payment-source-balances":
        return <PaymentSourceBalances />
      case "transaction-manager":
        return <TransactionManager />
      case "mortgage-calculator":
        return <MortgageCalculatorApp />
      case "ai-chat-console":
        return <AIChatConsole />
      case "credits-manager":
        return <CreditsManager />
      case "service-app":
        return <ServiceApp serviceName="Default Service" />
      case "debug-console":
        return <DebugConsole />
      case "about-this-desktop":
        return <AboutThisDesktopApp />
      case "desktop-settings":
        return <DesktopServiceSettings />
      default:
        return <div>App not found</div>
    }
  }

  const renderDesktopContent = () => {
    if (!isDesktopModeEnabled) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <h2 className="text-3xl font-bold mb-4">Welcome to Optimal Desktop</h2>
            <p className="text-lg opacity-90">Access your apps via the menu bar above</p>
            <p className="text-sm mt-2 opacity-70">
              Enable Desktop Service in Settings to show an app here
            </p>
          </div>
        </div>
      )
    }

    const desktopApp = appDefinitions.find((app) => app.id === selectedServiceId)
    if (!desktopApp) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <h2 className="text-2xl font-semibold mb-2">Select a desktop service</h2>
            <p className="text-sm opacity-80">
              Choose an app in Desktop Settings to display it as your desktop background
            </p>
          </div>
        </div>
      )
    }

    return <div className="h-full">{renderAppContent(desktopApp.id)}</div>
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 relative">
        {/* Menu Bar */}
        <MenuBar />

        {/* Desktop Content Area */}
        <div className="h-full pt-12 pb-20 px-4">
          <div className="h-full rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-gray-900/70 backdrop-blur-sm shadow-inner overflow-hidden">
            {renderDesktopContent()}
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
            <WindowFrame
              key={win.id}
              id={win.id}
              title={appDef.title}
              x={win.x}
              y={win.y}
              width={win.width}
              height={win.height}
              minimized={win.minimized}
              zIndex={win.zIndex}
              // The close button is handled internally by WindowFrame, no need for separate handler here
              // The drag and resize handlers are also handled by useWindowManager within WindowFrame
            >
              {renderAppContent(win.id as AppId)}
            </WindowFrame>
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

        {/* Taskbar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 px-4 py-2 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {windows.filter((w: WindowState) => !w.minimized).map((win: WindowState) => { // Filter for open and non-minimized windows
                const appDef = appDefinitions.find(app => app.id === (win.id as AppId))
                if (!appDef) return null

                return (
                  <button
                    key={win.id}
                    onClick={() => {
                      // Use focusWindow, which also unminimizes if needed
                      focusWindow(win.id)
                    }}
                    className={`px-3 py-1 rounded text-sm flex items-center gap-2 ${
                      activeWindowId === win.id // Highlight if it's the active window
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <img 
                      src={`/images/${win.id}.png`} 
                      alt={appDef.title}
                      className="w-4 h-4"
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
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

