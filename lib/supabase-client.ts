import { createBrowserClient } from "@supabase/ssr"
import { logger } from "@/lib/logger"

let supabaseInstance: any = null

export function createClient() {
  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    logger.error("SupabaseClient", "Missing Supabase environment variables", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      nodeEnv: process.env.NODE_ENV
    })
    return null
  }

  try {
    logger.debug('SupabaseClient', 'Initializing', { url: supabaseUrl })
    supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey)
    logger.debug('SupabaseClient', 'Successfully created')
    return supabaseInstance
  } catch (error) {
    logger.error("SupabaseClient", "Error creating Supabase client", error)
    return null
  }
}

// Default export for compatibility
export default createClient
