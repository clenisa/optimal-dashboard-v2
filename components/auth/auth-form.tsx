"use client"

import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { createClient } from "@/lib/supabase-client"
import { authLogger } from "@/lib/auth-logger"
import { InteractionDetector } from "@/lib/interaction-detector"
import { useRef, useEffect } from "react"

interface AuthFormProps {
  onError: (error: string) => void
}

export function AuthForm({ onError }: AuthFormProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : "/auth/callback"

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
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: "hsl(0 0% 9%)",
                brandAccent: "hsl(0 0% 45.1%)",
                inputBackground: "hsl(0 0% 96.1%)",
                inputBorder: "hsl(0 0% 89.8%)",
                inputText: "hsl(0 0% 3.9%)",
              },
            },
          },
          style: {
            button: {
              borderRadius: "6px",
              fontSize: "16px",
              padding: "14px 16px",
              minHeight: "48px",
              cursor: "pointer",
              touchAction: "manipulation",
              pointerEvents: "auto",
              userSelect: "none",
              WebkitUserSelect: "none",
              position: "relative",
              zIndex: "10",
              isolation: "isolate",
              width: "100%",
            },
            input: {
              borderRadius: "6px",
              fontSize: "16px",
              padding: "14px 16px",
              minHeight: "48px",
              touchAction: "manipulation",
              pointerEvents: "auto",
              position: "relative",
              zIndex: "10",
              width: "100%",
              WebkitAppearance: "none",
            },
            anchor: {
              fontSize: "14px",
              minHeight: "44px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              touchAction: "manipulation",
              pointerEvents: "auto",
              userSelect: "none",
              WebkitUserSelect: "none",
              position: "relative",
              zIndex: "10",
            },
            container: {
              touchAction: "auto",
              pointerEvents: "auto",
              position: "relative",
              zIndex: "1",
            },
            message: {
              fontSize: "14px",
              padding: "8px 12px",
            },
          },
        }}
        providers={["google"]}
        redirectTo={redirectTo}
        onlyThirdPartyProviders={false}
        view="sign_in"
      />
    </div>
  )
}
