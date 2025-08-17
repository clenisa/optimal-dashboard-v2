"use client"

import { useState, useEffect } from "react"
import { Monitor, Smartphone, Tablet, RotateCcw, X } from "lucide-react"

interface ResponsiveDebugProps {
  isOpen: boolean
  onClose: () => void
}

export function ResponsiveDebug({ isOpen, onClose }: ResponsiveDebugProps) {
  const [debugInfo, setDebugInfo] = useState({
    screenWidth: 0,
    screenHeight: 0,
    viewportWidth: 0,
    viewportHeight: 0,
    devicePixelRatio: 1,
    deviceType: "Desktop",
    orientation: "landscape",
    userAgent: "",
    touchSupport: false,
    scaleFactor: 1,
  })

  useEffect(() => {
    const updateDebugInfo = () => {
      const screen = window.screen
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      }
      
      // Determine device type
      let deviceType = "Desktop"
      if (viewport.width <= 768) {
        deviceType = "Mobile"
      } else if (viewport.width <= 1024) {
        deviceType = "Tablet"
      }

      // Determine orientation
      const orientation = viewport.width > viewport.height ? "landscape" : "portrait"

      // Check touch support
      const touchSupport = "ontouchstart" in window || navigator.maxTouchPoints > 0

      // Get scale factor from CSS custom property
      const scaleFactor = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--scale-factor')) || 1

      setDebugInfo({
        screenWidth: screen.width,
        screenHeight: screen.height,
        viewportWidth: viewport.width,
        viewportHeight: viewport.height,
        devicePixelRatio: window.devicePixelRatio || 1,
        deviceType,
        orientation,
        userAgent: navigator.userAgent.substring(0, 100) + "...",
        touchSupport,
        scaleFactor,
      })
    }

    updateDebugInfo()
    window.addEventListener("resize", updateDebugInfo)
    window.addEventListener("orientationchange", updateDebugInfo)

    return () => {
      window.removeEventListener("resize", updateDebugInfo)
      window.removeEventListener("orientationchange", updateDebugInfo)
    }
  }, [])

  if (!isOpen) return null

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "Mobile":
        return <Smartphone className="w-4 h-4" />
      case "Tablet":
        return <Tablet className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Responsive Debug Info
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded touch-optimized"
            aria-label="Close debug panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Device Type */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            {getDeviceIcon(debugInfo.deviceType)}
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {debugInfo.deviceType}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {debugInfo.orientation} orientation
              </div>
            </div>
          </div>

          {/* Screen Resolution */}
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Screen Resolution</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="text-gray-500 dark:text-gray-400">Screen</div>
                <div className="font-mono">{debugInfo.screenWidth} × {debugInfo.screenHeight}</div>
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="text-gray-500 dark:text-gray-400">Viewport</div>
                <div className="font-mono">{debugInfo.viewportWidth} × {debugInfo.viewportHeight}</div>
              </div>
            </div>
          </div>

          {/* Device Details */}
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Device Details</h3>
            <div className="space-y-2 text-sm">
              <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="text-gray-500 dark:text-gray-400">Pixel Ratio</div>
                <div className="font-mono">{debugInfo.devicePixelRatio}</div>
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="text-gray-500 dark:text-gray-400">Scale Factor</div>
                <div className="font-mono">{debugInfo.scaleFactor}</div>
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="text-gray-500 dark:text-gray-400">Touch Support</div>
                <div className="font-mono">{debugInfo.touchSupport ? "Yes" : "No"}</div>
              </div>
            </div>
          </div>

          {/* User Agent */}
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">User Agent</h3>
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
              {debugInfo.userAgent}
            </div>
          </div>

          {/* Responsive Breakpoints */}
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Current Breakpoint</h3>
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
              <div className="text-gray-500 dark:text-gray-400">CSS Media Query</div>
              <div className="font-mono">
                {debugInfo.viewportWidth <= 640 ? "Mobile (≤640px)" :
                 debugInfo.viewportWidth <= 768 ? "Small (≤768px)" :
                 debugInfo.viewportWidth <= 1024 ? "Medium (≤1024px)" :
                 debugInfo.viewportWidth <= 1280 ? "Large (≤1280px)" :
                 debugInfo.viewportWidth <= 1920 ? "XL (≤1920px)" :
                 debugInfo.viewportWidth <= 2560 ? "2XL (≤2560px)" :
                 debugInfo.viewportWidth <= 3840 ? "3XL (≤3840px)" : "4XL (>3840px)"}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 touch-optimized"
          >
            <RotateCcw className="w-4 h-4" />
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  )
}
