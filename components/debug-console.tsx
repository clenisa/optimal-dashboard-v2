// Simple debug console to display app logs in the UI.
"use client"

import { useState, useEffect, useRef, useCallback } from "react"

export function DebugConsole() {
  const [logs, setLogs] = useState<string[]>([])
  const consoleEndRef = useRef<HTMLDivElement>(null)
  const hasSetupLogging = useRef(false)
  const pendingLogs = useRef<string[]>([])

  // Debounced function to add logs without causing render issues
  const flushPendingLogs = useCallback(() => {
    if (pendingLogs.current.length > 0) {
      setLogs((prevLogs) => {
        const newLogs = [...prevLogs, ...pendingLogs.current]
        // Keep only the last 100 logs to prevent memory issues
        return newLogs.slice(-100)
      })
      pendingLogs.current = []
    }
  }, [])

  // Use a timer to flush pending logs
  useEffect(() => {
    const interval = setInterval(flushPendingLogs, 100) // Flush every 100ms
    return () => clearInterval(interval)
  }, [flushPendingLogs])

  useEffect(() => {
    if (hasSetupLogging.current) return
    hasSetupLogging.current = true

    const originalLog = console.log
    const originalWarn = console.warn
    const originalError = console.error

    const addLog = (type: string, ...args: any[]) => {
      const message = args
        .map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
        .join(" ")

      // Filter out excessive logs and noise
      const noisePatterns = [
        "window-move",
        "Rendering login form",
        "mouse",
        "resize",
        "scroll",
        "wheel",
        "pointer",
        "touch",
        "drag",
        "drop",
        "focus",
        "blur",
        "keydown",
        "keyup",
        "keypress",
        "input",
        "change",
        "click",
        "dblclick",
        "contextmenu",
        "mousedown",
        "mouseup",
        "mousemove",
        "mouseover",
        "mouseout",
        "mouseenter",
        "mouseleave",
        "transition",
        "animation",
        "transform",
        "translate",
        "scale",
        "rotate",
        "opacity",
        "visibility",
        "display",
        "position",
        "top",
        "left",
        "right",
        "bottom",
        "width",
        "height",
        "padding",
        "margin",
        "border",
        "background",
        "color",
        "font",
        "text",
        "line-height",
        "letter-spacing",
        "word-spacing",
        "text-align",
        "text-decoration",
        "text-transform",
        "text-shadow",
        "box-shadow",
        "border-radius",
        "z-index",
        "overflow",
        "float",
        "clear",
        "flex",
        "grid",
        "table",
        "list",
        "image",
        "video",
        "audio",
        "canvas",
        "svg",
        "path",
        "rect",
        "circle",
        "ellipse",
        "line",
        "polyline",
        "polygon",
        "text",
        "tspan",
        "g",
        "defs",
        "clipPath",
        "mask",
        "filter",
        "feGaussianBlur",
        "feOffset",
        "feMerge",
        "feMergeNode",
        "feColorMatrix",
        "feComponentTransfer",
        "feFuncR",
        "feFuncG",
        "feFuncB",
        "feFuncA",
        "feComposite",
        "feBlend",
        "feMorphology",
        "feConvolveMatrix",
        "feDisplacementMap",
        "feFlood",
        "feTile",
        "feTurbulence",
        "feDistantLight",
        "fePointLight",
        "feSpotLight",
        "feDiffuseLighting",
        "feSpecularLighting",
        "feImage",
        "feDropShadow",
        "feMerge",
        "feMergeNode",
        "feMorphology",
        "feConvolveMatrix",
        "feDisplacementMap",
        "feFlood",
        "feTile",
        "feTurbulence",
        "feDistantLight",
        "fePointLight",
        "feSpotLight",
        "feDiffuseLighting",
        "feSpecularLighting",
        "feImage",
        "feDropShadow"
      ]

      // Check if message contains any noise patterns
      const isNoise = noisePatterns.some(pattern => 
        message.toLowerCase().includes(pattern.toLowerCase())
      )

      // Only show debug messages, important errors, and chart-related debugging
      const isImportant = message.includes("[DEBUG]") || 
                         message.includes("Error") || 
                         message.includes("error") ||
                         message.includes("fetchCategories") ||
                         message.includes("CategoryLineChart") ||
                         message.includes("chart") ||
                         message.includes("supabase") ||
                         message.includes("categories") ||
                         message.includes("🔍") ||
                         message.includes("❌") ||
                         message.includes("⚠️")

      // Filter out noise unless it's important debugging information
      if (isNoise && !isImportant) {
        return
      }

      // Additional filtering for very noisy patterns that aren't related to our debugging
      if (message.includes("React") && !isImportant) {
        return
      }

      // Add to pending logs instead of directly updating state
      const logEntry = `[${new Date().toLocaleTimeString()}] [${type.toUpperCase()}] ${message}`
      pendingLogs.current.push(logEntry)

      // Don't flush immediately to avoid render cycle issues
    }

    console.log = (...args) => {
      originalLog.apply(console, args)
      // Use setTimeout to defer the log addition
      setTimeout(() => addLog("log", ...args), 0)
    }
    console.warn = (...args) => {
      originalWarn.apply(console, args)
      setTimeout(() => addLog("warn", ...args), 0)
    }
    console.error = (...args) => {
      originalError.apply(console, args)
      setTimeout(() => addLog("error", ...args), 0)
    }

    return () => {
      console.log = originalLog
      console.warn = originalWarn
      console.error = originalError
    }
  }, [])

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  return (
    <div className="flex flex-col h-full bg-black text-green-400 font-mono text-xs p-2">
      <div className="flex justify-between items-center mb-2 border-b border-green-800 pb-2">
        <div className="text-gray-500 text-xs">Debug Console - {logs.length} entries</div>
        <button
          onClick={() => setLogs([])}
          className="px-2 py-1 bg-green-800 text-green-400 text-xs rounded hover:bg-green-700 transition-colors"
        >
          Clear
        </button>
      </div>
      <div className="flex-grow overflow-y-auto">
        {logs.length === 0 && <div className="text-gray-500 italic">Console output will appear here...</div>}
        {logs.map((log, index) => (
          <div key={index} className="whitespace-pre-wrap break-all mb-1">
            {log}
          </div>
        ))}
        <div ref={consoleEndRef} />
      </div>
      <div className="mt-2 pt-2 border-t border-green-800">
        <div className="text-gray-500 text-xs">Filtered for chart debugging and important messages</div>
      </div>
    </div>
  )
}
