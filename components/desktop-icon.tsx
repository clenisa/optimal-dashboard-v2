"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase-client"
import { useVibration } from "@/hooks/use-vibration"
import { logger } from "@/lib/logger"

interface DesktopIconProps {
  id: string
  title: string
  icon: string
  onClick: () => void
  requiresAuth?: boolean
}

export function DesktopIcon({ id, title, icon, onClick, requiresAuth = false }: DesktopIconProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const vibrate = useVibration({ duration: 30 })

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) {
      setLoading(false)
      return
    }
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setIsAuthenticated(!!session)
        setLoading(false)
      } catch (error) {
        logger.error("DesktopIcon", "Auth check error", error)
        setLoading(false)
      }
    }
    checkAuth()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setIsAuthenticated(!!session)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleClick = () => {
    onClick()
    vibrate()
  }

  if (requiresAuth && !isAuthenticated) {
    return null
  }

  return (
    <button
      id={id}
      className="flex flex-col items-center p-2 hover:bg-gray-200 rounded transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-black min-w-[80px] touch-manipulation"
      onClick={handleClick}
      aria-label={`Open ${title} application`}
      style={{ touchAction: "manipulation", pointerEvents: "auto", cursor: "pointer" }}
    >
      <div className="relative w-12 h-12 sm:w-16 sm:h-16">
        <Image
          src={icon || "/placeholder.svg"}
          alt={title}
          width={64}
          height={64}
          className="animate-in fade-in-0 zoom-in-95 w-full h-full object-contain"
          priority={!requiresAuth}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded">
            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-black"></div>
          </div>
        )}
      </div>
      <span className="text-xs font-mono text-black mt-1 text-center leading-tight">{title}</span>
    </button>
  )
}
