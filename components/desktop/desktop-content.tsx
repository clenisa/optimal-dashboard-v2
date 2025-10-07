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
      <div className="flex h-full items-center justify-center px-4">
        <div className="max-w-xl rounded-2xl border border-border/60 bg-muted/40 p-8 text-center shadow-sm backdrop-blur supports-[backdrop-filter]:bg-muted/30">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground">Welcome to Optimal Desktop</h2>
          <p className="text-base text-muted-foreground">
            Access your favorite AI assistants, financial dashboards, and tools directly from the menu
            bar.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Enable Desktop Service in Settings to pin an app as your always-on workspace.
          </p>
        </div>
      </div>
    )
  }

  if (!selectedServiceId) {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-dashed border-border/70 bg-muted/30 p-6 text-center">
          <h2 className="mb-3 text-2xl font-semibold text-foreground">Select a desktop service</h2>
          <p className="text-sm text-muted-foreground">
            Choose an app in Desktop Settings to display it as your desktop background. You can swap
            between dashboards any time from the menu bar.
          </p>
        </div>
      </div>
    )
  }

  const desktopApp = appDefinitions.find((app) => app.id === selectedServiceId)
  if (!desktopApp) {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-destructive/40 bg-destructive/10 p-6 text-center text-destructive">
          <h2 className="mb-2 text-2xl font-semibold">App not found</h2>
          <p className="text-sm opacity-90">The selected service is not available.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-hidden rounded-2xl border border-border/60 bg-card/60 shadow-inner backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <AppRenderer appId={desktopApp.id} />
    </div>
  )
}
