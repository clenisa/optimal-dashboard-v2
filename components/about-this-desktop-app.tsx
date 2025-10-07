"use client"

import Image from "next/image"
import { useWindowStore } from "@/store/window-store"

export function AboutThisDesktopApp() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 bg-system7-window-bg text-system7-title-bar text-center">
      <Image src="/images/optimal-os.png" alt="Optimal OS Logo" width={80} height={80} className="mb-4" />
      <h2 className="text-2xl font-bold mb-2">Optimal OS</h2>
      <p className="text-sm mb-1">Version 1.0.0 &ldquo;Genesis&rdquo;</p>
      <p className="text-xs mb-4">A New Paradigm in Web-Based Computing</p>
      <div className="text-xs text-gray-600 border-t border-gray-300 pt-3 mt-3 w-full max-w-xs">
        <p>&copy; 2024-2025 Optimal Systems</p>
        <p>Powered by Next.js, React, Zustand, Supabase, and Tailwind CSS.</p>
        <p>UI Components from shadcn/ui.</p>
      </div>
      <button
        className="mt-6 px-4 py-2 bg-gray-200 border border-system7-border text-system7-title-bar text-sm rounded-sm hover:bg-gray-300 focus:outline-none focus:ring-1 focus:ring-system7-title-bar"
        onClick={() => {
          const currentWindow = useWindowStore.getState().windows.find((w) => w.id === "about-this-desktop")
          if (currentWindow) {
            useWindowStore.getState().removeWindow(currentWindow.id)
          }
        }}
      >
        OK
      </button>
    </div>
  )
}
