"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Volume, Volume1, Volume2, VolumeX, Settings } from "lucide-react"

export function VolumeControl() {
  const [volume, setVolume] = useState(50) // Default volume 0-100
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [prevVolume, setPrevVolume] = useState(50)

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="h-3 w-3 sm:h-4 sm:w-4" />
    if (volume < 33) return <Volume className="h-3 w-3 sm:h-4 sm:w-4" />
    if (volume < 66) return <Volume1 className="h-3 w-3 sm:h-4 sm:w-4" />
    return <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
  }

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0])
    if (newVolume[0] > 0 && isMuted) {
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume > 0 ? prevVolume : 50) // Restore previous volume or default
      setIsMuted(false)
    } else {
      setPrevVolume(volume)
      setVolume(0)
      setIsMuted(true)
    }
  }

  // Apply volume to actual audio elements if needed (not implemented here)
  useEffect(() => {
    // Volume state changed; hook for integrating with actual audio elements
    // Example: document.querySelectorAll('audio').forEach(audio => audio.volume = volume / 100);
  }, [volume, isMuted])

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 sm:h-6 sm:w-6 text-sm px-1 py-1 border-none rounded-none hover:bg-black hover:text-white active:bg-black active:text-white focus-visible:ring-0 focus-visible:ring-offset-0 touch-manipulation"
          onClick={(e) => {
            // Allow dropdown to open, but also handle mute toggle on direct click
            if (e.target === e.currentTarget || (e.target as HTMLElement).closest("svg")) {
              // If dropdown is already open, direct click should mute/unmute
              if (isDropdownOpen) {
                toggleMute()
                // e.preventDefault() // Prevent dropdown from closing if already open
              }
            }
          }}
        >
          {getVolumeIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-2 pt-4 w-auto min-w-[32px] h-40 flex flex-col items-center justify-center bg-card border-border shadow-md rounded-none">
        <Slider
          orientation="vertical"
          defaultValue={[volume]}
          value={[volume]}
          max={100}
          step={1}
          onValueChange={handleVolumeChange}
          className="h-24 data-[orientation=vertical]:w-2"
        />
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 h-6 w-6 text-sm border-none rounded-none hover:bg-accent hover:text-accent-foreground active:bg-accent active:text-accent-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
          onClick={() => alert("Volume settings placeholder")}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
