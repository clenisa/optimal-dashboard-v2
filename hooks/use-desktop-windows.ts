"use client"

import { useCallback } from 'react'
import { appDefinitions, type AppId } from '@/lib/app-definitions'
import { useWindowStore, type WindowState, type WindowStore } from '@/store/window-store'

interface UseDesktopWindowsResult {
  windows: WindowState[]
  activeWindowId: WindowStore['activeWindowId']
  openWindow: (appId: AppId) => void
  closeWindow: (appId: AppId) => void
  minimizeWindow: (appId: AppId) => void
  focusWindow: (appId: AppId) => void
}

export function useDesktopWindows(): UseDesktopWindowsResult {
  const windows = useWindowStore((state: WindowStore) => state.windows)
  const addWindow = useWindowStore((state: WindowStore) => state.addWindow)
  const removeWindow = useWindowStore((state: WindowStore) => state.removeWindow)
  const updateWindow = useWindowStore((state: WindowStore) => state.updateWindow)
  const focusWindow = useWindowStore((state: WindowStore) => state.focusWindow)
  const activeWindowId = useWindowStore((state: WindowStore) => state.activeWindowId)

  const openWindow = useCallback(
    (appId: AppId) => {
      const appDef = appDefinitions.find((app) => app.id === appId)
      if (!appDef) return

      addWindow({
        id: appId,
        title: appDef.title,
        x: 50 + windows.length * 30,
        y: 50 + windows.length * 30,
        width: appDef.defaultWidth,
        height: appDef.defaultHeight,
        minimized: false,
      })
    },
    [addWindow, windows.length],
  )

  const closeWindow = useCallback((appId: AppId) => {
    removeWindow(appId)
  }, [removeWindow])

  const minimizeWindow = useCallback(
    (appId: AppId) => {
      updateWindow(appId, { minimized: true })
    },
    [updateWindow],
  )

  const focusDesktopWindow = useCallback(
    (appId: AppId) => {
      focusWindow(appId)
    },
    [focusWindow],
  )

  return {
    windows,
    activeWindowId,
    openWindow,
    closeWindow,
    minimizeWindow,
    focusWindow: focusDesktopWindow,
  }
}
