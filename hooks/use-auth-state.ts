"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase-client"
import { authLogger } from "@/lib/auth-logger"

interface User {
  id: string
  email?: string
}

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    if (!supabase) {
      authLogger.log("Supabase client not available")
      setLoading(false)
      return
    }

    authLogger.log("Initializing auth state")
    authLogger.log("Environment check", {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV,
    })

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          authLogger.log("Session error", { error: error.message })
        } else if (session?.user) {
          const userData = {
            id: session.user.id,
            email: session.user.email,
          }
          setUser(userData)
          authLogger.log("Initial session check", { hasSession: true })
        } else {
          authLogger.log("Initial session check", { hasSession: false })
        }
      } catch (error) {
        authLogger.log("Error getting initial session", { error })
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      authLogger.log("Auth state change", {
        event,
        hasSession: !!session,
      })

      if (session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email,
        }
        setUser(userData)

        if (event === "SIGNED_IN") {
          authLogger.log("Login successful", { email: session.user.email })
        }
      } else {
        setUser(null)

        if (event === "SIGNED_OUT") {
          authLogger.log("Logout successful")
        }
      }

      setLoading(false)
    })

    return () => {
      authLogger.log("Cleaning up auth listener")
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading }
}
