"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useDesktopServiceStore } from "@/store/desktop-service-store"
import { getDesktopCapableApps } from "@/lib/app-definitions"
import { Monitor } from "lucide-react"

export function DesktopServiceSettings() {
  const {
    selectedServiceId,
    isDesktopModeEnabled,
    setSelectedService,
    setDesktopMode,
  } = useDesktopServiceStore()

  const desktopCapableApps = getDesktopCapableApps()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="w-5 h-5" />
          Desktop Service Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="desktop-mode">Enable Desktop Service</Label>
            <div className="text-sm text-gray-500">
              Show a service as your desktop background instead of the default view
            </div>
          </div>
          <Switch id="desktop-mode" checked={isDesktopModeEnabled} onCheckedChange={setDesktopMode} />
        </div>

        {isDesktopModeEnabled && (
          <div className="space-y-2">
            <Label htmlFor="service-select">Desktop Service</Label>
            <Select value={selectedServiceId} onValueChange={setSelectedService}>
              <SelectTrigger>
                <SelectValue placeholder="Select a service for your desktop" />
              </SelectTrigger>
              <SelectContent>
                {desktopCapableApps.map((app) => (
                  <SelectItem key={app.id} value={app.id}>
                    <div className="flex flex-col">
                      <span>{app.title}</span>
                      <span className="text-xs text-gray-500">{app.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-xs text-gray-500">
              Selected service will appear as your desktop background and won't show in dropdown menus
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
