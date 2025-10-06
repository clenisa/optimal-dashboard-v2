"use client"

import { MenuBar } from '@/components/menu-bar'
import { ThemeProvider } from '@/components/theme-manager'
import { DesktopContent } from '@/components/desktop/desktop-content'
import { WindowStack } from '@/components/desktop/window-stack'
import { Taskbar } from '@/components/desktop/taskbar'
import { useDesktopServiceStore } from '@/store/desktop-service-store'
import { useDesktopWindows } from '@/hooks/use-desktop-windows'
import { useSupabaseUser } from '@/hooks/use-supabase-user'

export default function Home() {
  const user = useSupabaseUser()
  const { windows, activeWindowId, focusWindow } = useDesktopWindows()
  const { selectedServiceId, isDesktopModeEnabled } = useDesktopServiceStore()

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <MenuBar />

        <div className="h-full px-4 pb-20 pt-12">
          <div className="h-full overflow-hidden rounded-2xl border border-black/10 bg-white/80 shadow-inner backdrop-blur-sm dark:border-white/10 dark:bg-gray-900/70">
            <DesktopContent
              isDesktopModeEnabled={isDesktopModeEnabled}
              selectedServiceId={selectedServiceId}
            />
          </div>
        </div>

        <WindowStack windows={windows} />

        <Taskbar
          windows={windows}
          activeWindowId={activeWindowId}
          onFocusWindow={focusWindow}
          user={user}
        />
      </div>
    </ThemeProvider>
  )
}
