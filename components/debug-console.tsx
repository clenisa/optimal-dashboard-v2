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
      setLogs((prevLogs) => [...prevLogs, ...pendingLogs.current])
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

      // Filter out excessive logs
      if (message.includes("window-move") || message.includes("Rendering login form")) {
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
        <div className="text-gray-500 text-xs">Debug Console Ready - {logs.length} entries</div>
      </div>
    </div>
  )
}
