"use client"

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase-client'
import { logger } from '@/lib/logger'

export function useSupabaseUser(onAuthChange?: (user: User | null) => void): User | null {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) {
      logger.warn('SupabaseUser', 'Supabase client unavailable; auth disabled')
      setUser(null)
      onAuthChange?.(null)
      return
    }

    supabase.auth.getUser().then(({ data: { user: nextUser } }) => {
      setUser(nextUser)
      onAuthChange?.(nextUser)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null
      setUser(nextUser)
      onAuthChange?.(nextUser)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [onAuthChange])

  return user
}
