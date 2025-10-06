"use client"

import { AppRenderer } from '@/components/desktop/app-renderer'
import { appDefinitions, type AppId } from '@/lib/app-definitions'

interface DesktopContentProps {
  isDesktopModeEnabled: boolean
  selectedServiceId: AppId | null | undefined
}

export function DesktopContent({ isDesktopModeEnabled, selectedServiceId }: DesktopContentProps) {
  if (!isDesktopModeEnabled) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <h2 className="mb-4 text-3xl font-bold">Welcome to Optimal Desktop</h2>
          <p className="text-lg opacity-90">Access your apps via the menu bar above</p>
          <p className="mt-2 text-sm opacity-70">Enable Desktop Service in Settings to show an app here</p>
        </div>
      </div>
    )
  }

  if (!selectedServiceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <h2 className="mb-2 text-2xl font-semibold">Select a desktop service</h2>
          <p className="text-sm opacity-80">
            Choose an app in Desktop Settings to display it as your desktop background
          </p>
        </div>
      </div>
    )
  }

  const desktopApp = appDefinitions.find((app) => app.id === selectedServiceId)
  if (!desktopApp) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <h2 className="mb-2 text-2xl font-semibold">App not found</h2>
          <p className="text-sm opacity-80">The selected service is not available.</p>
        </div>
      </div>
    )
  }

  return <div className="h-full"><AppRenderer appId={desktopApp.id} /></div>
}
