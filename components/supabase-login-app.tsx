"use client"

import { useEffect, useRef, useState } from "react"
import { useVibration } from "@/hooks/use-vibration"
import { useAuthState } from "@/hooks/use-auth-state"
import { AuthForm } from "./auth/auth-form"
import { createClient } from "@/lib/supabase-client"
import { logger } from "@/lib/logger"
import { PasswordUpdateModal } from "./auth/password-update-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { SPACING_TOKENS, SURFACE_TOKENS, TYPOGRAPHY_TOKENS } from "@/lib/design-tokens"

export function SupabaseLoginApp() {
  const { user, loading } = useAuthState()
  const vibrate = useVibration({ duration: 50 })
  const hasLoggedInitialization = useRef(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)

  const signOut = async () => {
    const supabase = createClient()
    if (supabase) {
      await supabase.auth.signOut()
      vibrate()
    }
  }

  useEffect(() => {
    if (!hasLoggedInitialization.current) {
      setTimeout(() => {
        logger.debug("SupabaseLoginApp", "Initializing")
        logger.debug("SupabaseLoginApp", "Supabase env", {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        })
      }, 0)
      hasLoggedInitialization.current = true
    }
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Card className={cn("w-full max-w-sm border text-center", SURFACE_TOKENS.primary)}>
          <CardContent className="flex flex-col items-center gap-3 py-10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Checking your session...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Card className={cn("w-full max-w-md border text-center", SURFACE_TOKENS.primary)}>
          <CardHeader className="space-y-1">
            <CardTitle className={TYPOGRAPHY_TOKENS.heading}>You&rsquo;re signed in</CardTitle>
            <CardDescription className={TYPOGRAPHY_TOKENS.subheading}>
              Manage your account preferences below.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button variant="outline" onClick={() => setIsPasswordModalOpen(true)}>
              Update Password
            </Button>
            <Button variant="destructive" onClick={signOut} className="font-medium">
              Log Out
            </Button>
          </CardContent>
        </Card>
        <PasswordUpdateModal open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen} />
      </div>
    )
  }

  return (
    <div className="flex h-full items-center justify-center p-6">
      <Card className={cn("w-full max-w-md border", SURFACE_TOKENS.primary)}>
        <CardHeader className="space-y-2 text-center">
          <CardTitle className={TYPOGRAPHY_TOKENS.heading}>Login / Sign Up</CardTitle>
          <CardDescription className={TYPOGRAPHY_TOKENS.subheading}>
            Access your Optimal dashboard experience with secure Supabase authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className={SPACING_TOKENS.section}>
          <AuthForm onError={() => {}} />
          <div
            className={cn(
              "rounded-lg border border-dashed text-center text-xs text-muted-foreground",
              SURFACE_TOKENS.secondary,
              SPACING_TOKENS.compact,
            )}
          >
            <p className="truncate">
              Redirect URL: {typeof window !== "undefined" ? window.location.origin + "/auth/callback" : "/auth/callback"}
            </p>
            <p>Environment: {process.env.NODE_ENV}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
