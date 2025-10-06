"use client"

import { ThemeSwitcher } from '@/components/theme-manager'
import type { WindowState } from '@/store/window-store'
import type { AppId } from '@/lib/app-definitions'
import type { User } from '@supabase/supabase-js'
import type { SyntheticEvent } from 'react'

interface TaskbarProps {
  windows: WindowState[]
  activeWindowId: string | null
  onFocusWindow: (appId: AppId) => void
  user: User | null
}

export function Taskbar({ windows, activeWindowId, onFocusWindow, user }: TaskbarProps) {
  const openWindows = windows.filter((window) => !window.minimized)

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-gray-200 bg-white/80 px-4 py-2 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/80">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {openWindows.map((window) => (
            <button
              key={window.id}
              onClick={() => onFocusWindow(window.id as AppId)}
              className={`flex items-center gap-2 rounded px-3 py-1 text-sm ${
                activeWindowId === window.id
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-400'
              }`}
            >
              <img
                src={`/images/${window.id}.png`}
                alt={window.title}
                className="h-4 w-4"
                onError={(event: SyntheticEvent<HTMLImageElement>) => {
                  event.currentTarget.style.display = 'none'
                }}
              />
              {window.title}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          {user && (
            <div className="text-sm text-gray-600 dark:text-gray-400">Welcome, {user.email}</div>
          )}
        </div>
      </div>
    </div>
  )
}
