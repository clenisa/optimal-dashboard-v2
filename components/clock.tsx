"use client"

import { useState, useEffect } from "react"

export function Clock() {
  const [time, setTime] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTime(new Date())

    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: false,
    })
  }

  // Don't render anything until mounted on client
  if (!mounted || !time) {
    return (
      <div className="text-xs sm:text-sm text-black select-none px-1">
        --:--
      </div>
    )
  }

  return (
    <div className="text-xs sm:text-sm text-black select-none px-1">
      {formatTime(time)}
    </div>
  )
}
