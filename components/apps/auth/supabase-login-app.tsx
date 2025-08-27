"use client"

import { useEffect, useRef } from "react"
import { useVibration } from "@/hooks/use-vibration"
import { useAuthState } from "@/hooks/use-auth-state"
import { AuthForm } from "../../auth/auth-form"
import { createClient } from "@/lib/supabase-client"

export function SupabaseLoginApp() {
  const { user, loading } = useAuthState()
  const vibrate = useVibration({ duration: 50 })
  const hasLoggedInitialization = useRef(false)

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
        console.log("SupabaseLoginApp: Initializing...")
        console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
        console.log("Supabase Key exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      }, 0)
      hasLoggedInitialization.current = true
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <p className="text-sm optimal-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex items-center justify-center h-full p-6 sm:p-4">
        <div className="optimal-card rounded-lg p-6 w-full max-w-md text-center">
          <h2 className="text-xl font-bold mb-4 text-green-400">You are logged in</h2>
          <button
            onClick={signOut}
            className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors min-h-[44px] text-sm"
            style={{ touchAction: "manipulation", cursor: "pointer" }}
          >
            Log Out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-full p-6 sm:p-4">
      <div className="optimal-card rounded-lg p-6 w-full max-w-md">
        <h2 className="optimal-text-primary text-2xl font-bold mb-4">Welcome Back</h2>
        <p className="optimal-text-secondary mb-6">Please sign in to continue</p>
        <div className="w-full">
          <AuthForm onError={() => {}} />
        </div>
        <div className="mt-6 sm:mt-4 text-xs optimal-text-secondary text-center">
          <p>Redirect URL: {typeof window !== "undefined" ? window.location.origin + "/auth/callback" : "/auth/callback"}</p>
          <p>Environment: {process.env.NODE_ENV}</p>
        </div>
      </div>
    </div>
  )
}

export default SupabaseLoginApp
