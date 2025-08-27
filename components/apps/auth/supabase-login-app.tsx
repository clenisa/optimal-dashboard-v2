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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
          <p className="text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <h2 className="text-xl font-bold mb-4 text-green-600">You are logged in</h2>
        <button
          onClick={signOut}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors min-h-[44px] text-sm"
          style={{ touchAction: "manipulation", cursor: "pointer" }}
        >
          Log Out
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 sm:p-4">
      <h2 className="text-lg font-bold mb-6 sm:mb-4">Login / Sign Up</h2>
      <div className="w-full max-w-sm">
        <AuthForm onError={() => {}} />
      </div>
      <div className="mt-6 sm:mt-4 text-xs text-gray-500 text-center">
        <p>Redirect URL: {typeof window !== "undefined" ? window.location.origin + "/auth/callback" : "/auth/callback"}</p>
        <p>Environment: {process.env.NODE_ENV}</p>
      </div>
    </div>
  )
}

export default SupabaseLoginApp
