"use client"

import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { createClient } from "@/lib/supabase-client"
import { authLogger } from "@/lib/auth-logger"
import { InteractionDetector } from "@/lib/interaction-detector"
import { useRef, useEffect } from "react"
import { useTheme } from "next-themes"

interface AuthFormProps {
  onError: (error: string) => void
}

export function AuthForm({ onError }: AuthFormProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const { theme } = useTheme()

  const origin = typeof window !== "undefined" ? window.location.origin : ""
  const redirectTo = `${origin}/auth/callback`

  useEffect(() => {
    authLogger.log("AuthForm mounted. Redirect URL set to:", { redirectTo })
  }, [redirectTo])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement
      const elementInfo = InteractionDetector.getElementInfo(target)
      const isInteractive = InteractionDetector.isInteractive(target, containerRef)

      authLogger.interaction("Auth form element clicked", "click", {
        ...elementInfo,
        isInteractive,
        eventPhase: e.eventPhase,
        bubbles: e.bubbles,
        cancelable: e.cancelable,
        defaultPrevented: e.defaultPrevented,
      })

      if (isInteractive) {
        authLogger.interaction("Ensuring interactive element works", "focus", {
          tagName: target.tagName,
          className: target.className,
        })
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
          setTimeout(() => {
            ;(target as HTMLInputElement).focus()
          }, 0)
        }
      }
    }

    const handleMouseDown = (e: Event) => {
      const target = e.target as HTMLElement
      const isInteractive = InteractionDetector.isInteractive(target, containerRef)
      if (isInteractive) {
        e.stopPropagation()
      }
    }

    const handleTouchStart = (e: Event) => {
      const target = e.target as HTMLElement
      const isInteractive = InteractionDetector.isInteractive(target, containerRef)
      if (isInteractive) {
        e.stopPropagation()
      }
    }

    container.addEventListener("click", handleClick, { capture: true })
    container.addEventListener("mousedown", handleMouseDown, { capture: true })
    container.addEventListener("touchstart", handleTouchStart, { capture: true })

    return () => {
      container.removeEventListener("click", handleClick, { capture: true })
      container.removeEventListener("mousedown", handleMouseDown, { capture: true })
      container.removeEventListener("touchstart", handleTouchStart, { capture: true })
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="supabase-auth-container w-full"
      style={{
        pointerEvents: "auto",
        touchAction: "auto",
        isolation: "isolate",
      }}
    >
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        theme={theme === "dark" ? "dark" : "default"}
        showLinks={false}
        providers={[]}
        redirectTo={redirectTo}
        view="sign_in"
      />
    </div>
  )
}
