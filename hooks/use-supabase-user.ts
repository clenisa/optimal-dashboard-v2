"use client"

import { useEffect, useState } from 'react'
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'
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

    const loadInitialUser = async () => {
      const { data } = await supabase.auth.getUser()
      const currentUser = data.user ?? null
      setUser(currentUser)
      onAuthChange?.(currentUser)
    }

    void loadInitialUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      logger.debug('SupabaseUser', 'Auth state change', { event })
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
