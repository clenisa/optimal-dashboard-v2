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
        <Card className="w-full max-w-sm border-border/60 bg-card/80 text-center">
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
        <Card className="w-full max-w-md border-border/60 bg-card/80 text-center">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">You&rsquo;re signed in</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
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
      <Card className="w-full max-w-md border-border/60 bg-card/80">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-lg">Login / Sign Up</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Access your Optimal dashboard experience with secure Supabase authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AuthForm onError={() => {}} />
          <div className="rounded-lg border border-dashed border-border/60 bg-muted/40 p-3 text-center text-xs text-muted-foreground">
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
