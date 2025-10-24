"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Slider } from "@/components/ui/slider"
import { AccessibleButton } from "@/components/ui/accessible-button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Volume, Volume1, Volume2, VolumeX, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const AUDIO_PRESETS = [
  { id: "focus", label: "Focus • 30%", value: 30 },
  { id: "balanced", label: "Balanced • 60%", value: 60 },
  { id: "max", label: "Max Output • 90%", value: 90 },
]

const AUDIO_DEVICES = [
  { id: "system", label: "System Default" },
  { id: "speakers", label: "External Speakers" },
  { id: "headphones", label: "Headphones" },
]

export function VolumeControl() {
  const [volume, setVolume] = useState(50)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [prevVolume, setPrevVolume] = useState(50)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState(AUDIO_DEVICES[0]?.id ?? "system")

  const volumeIcon = useMemo(() => {
    if (isMuted || volume === 0) return <VolumeX className="h-4 w-4" />
    if (volume < 33) return <Volume className="h-4 w-4" />
    if (volume < 66) return <Volume1 className="h-4 w-4" />
    return <Volume2 className="h-4 w-4" />
  }, [isMuted, volume])

  const applyVolume = useCallback(
    (next: number) => {
      setVolume(next)
      if (next > 0 && isMuted) {
        setIsMuted(false)
      }
    },
    [isMuted],
  )

  const handleVolumeChange = useCallback(
    (nextVolume: number[]) => {
      const next = nextVolume[0]
      applyVolume(next)
      if (next === 0) {
        setIsMuted(true)
      } else {
        setPrevVolume(next)
      }
    },
    [applyVolume],
  )

  const toggleMute = useCallback(() => {
    if (isMuted) {
      applyVolume(prevVolume > 0 ? prevVolume : 50)
      setIsMuted(false)
    } else {
      setPrevVolume(volume)
      applyVolume(0)
      setIsMuted(true)
    }
  }, [applyVolume, isMuted, prevVolume, volume])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "m") {
        event.preventDefault()
        toggleMute()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleMute])

  useEffect(() => {
    // Hook for integrating with actual audio elements or Web Audio API
    // Example: document.querySelectorAll('audio').forEach(audio => { audio.volume = isMuted ? 0 : volume / 100 })
  }, [volume, isMuted])

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <AccessibleButton
            variant="ghost"
            size="sm"
            className="h-7 w-7 sm:h-6 sm:w-6 rounded-md px-0 text-sm hover:bg-hover-primary hover:text-primary focus-visible:ring-0 focus-visible:ring-offset-0"
            ariaLabel={isMuted ? "Unmute audio" : "Open volume controls"}
            ariaPressed={isMuted}
            onClick={(event) => {
              if (isDropdownOpen && (event.target === event.currentTarget || (event.target as HTMLElement).closest("svg"))) {
                event.preventDefault()
                toggleMute()
              }
            }}
          >
            {volumeIcon}
          </AccessibleButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="flex h-48 w-auto min-w-[44px] flex-col items-center justify-center gap-3 rounded-md border border-border/60 bg-card p-3 shadow-sm"
        >
          <Slider
            orientation="vertical"
            value={[volume]}
            max={100}
            step={1}
            onValueChange={handleVolumeChange}
            aria-label="Volume"
            className="h-24 data-[orientation=vertical]:w-2"
          />
          <AccessibleButton
            variant="ghost"
            size="icon"
            ariaLabel="Open volume settings"
            className="h-8 w-8 rounded-md hover:bg-hover-secondary"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings className="h-4 w-4" />
          </AccessibleButton>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-md space-y-4">
          <DialogHeader>
            <DialogTitle>Audio Settings</DialogTitle>
            <DialogDescription>
              Choose your output device, apply presets, and review keyboard shortcuts.
            </DialogDescription>
          </DialogHeader>

          <section className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Output device</h3>
            <div className="grid gap-2">
              {AUDIO_DEVICES.map((device) => (
                <label
                  key={device.id}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors",
                    selectedDevice === device.id
                      ? "border-primary/60 bg-hover-primary text-primary"
                      : "border-border/60 hover:border-primary/50 hover:bg-hover-primary",
                  )}
                >
                  <span>{device.label}</span>
                  <input
                    type="radio"
                    name="audio-device"
                    value={device.id}
                    checked={selectedDevice === device.id}
                    onChange={() => setSelectedDevice(device.id)}
                    className="sr-only"
                    aria-label={`Use ${device.label}`}
                  />
                  {selectedDevice === device.id && <Badge variant="outline">Active</Badge>}
                </label>
              ))}
            </div>
          </section>

          <Separator />

          <section className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Volume presets</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {AUDIO_PRESETS.map((preset) => (
                <AccessibleButton
                  key={preset.id}
                  variant="outline"
                  size="sm"
                  ariaLabel={`Set volume to ${preset.label}`}
                  className={cn(
                    "justify-between",
                    volume === preset.value && !isMuted ? "border-primary text-primary" : undefined,
                  )}
                  onClick={() => {
                    setIsMuted(false)
                    setPrevVolume(preset.value)
                    applyVolume(preset.value)
                  }}
                >
                  {preset.label}
                </AccessibleButton>
              ))}
            </div>
          </section>

          <Separator />

          <section className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Keyboard shortcuts</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                <kbd className="rounded border border-border/60 bg-muted px-1 py-0.5 text-xs">Ctrl / ⌘ + M</kbd>{" "}
                Toggle mute
              </li>
              <li>
                <kbd className="rounded border border-border/60 bg-muted px-1 py-0.5 text-xs">↑ / ↓</kbd> Adjust volume when menu is open
              </li>
            </ul>
          </section>
        </DialogContent>
      </Dialog>
    </>
  )
}
