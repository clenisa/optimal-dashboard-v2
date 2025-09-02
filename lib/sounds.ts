// lib/sounds.ts
type SoundName = "window-move" | "window-resize"
import { logger } from "@/lib/logger"

const sounds: Record<SoundName, HTMLAudioElement | null> = {
  "window-move": null,
  "window-resize": null,
}

let currentPlayingLoop: HTMLAudioElement | null = null

export const loadSounds = () => {
  // Temporarily disabled to prevent 404 errors
  // if (typeof window !== "undefined") {
  //   sounds["window-move"] = new Audio("/sounds/window-move.mp3")
  //   sounds["window-move"].loop = true
  //   sounds["window-move"].volume = 0.5

  //   sounds["window-resize"] = new Audio("/sounds/window-resize.mp3")
  //   sounds["window-resize"].loop = true
  //   sounds["window-resize"].volume = 0.5
  // }
}

export const playSound = (name: SoundName, loop = false) => {
  const sound = sounds[name]
  if (sound) {
    if (currentPlayingLoop && currentPlayingLoop !== sound) {
      currentPlayingLoop.pause()
      currentPlayingLoop.currentTime = 0
    }
    sound.play().catch((e) => logger.error("Sounds", "Error playing sound", e))
    if (loop) {
      currentPlayingLoop = sound
    }
  }
}

export const stopSound = (name: SoundName) => {
  const sound = sounds[name]
  if (sound) {
    sound.pause()
    sound.currentTime = 0
    if (currentPlayingLoop === sound) {
      currentPlayingLoop = null
    }
  }
}

export const stopAllSounds = () => {
  if (currentPlayingLoop) {
    currentPlayingLoop.pause()
    currentPlayingLoop.currentTime = 0
    currentPlayingLoop = null
  }
  Object.values(sounds).forEach((sound) => {
    if (sound) {
      sound.pause()
      sound.currentTime = 0
    }
  })
}
