import { createBrowserClient } from "@supabase/ssr"

let supabaseInstance: any = null

export function createClient() {
  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[ERROR] Missing Supabase environment variables:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      nodeEnv: process.env.NODE_ENV
    })
    return null
  }

  try {
    console.log('[DEBUG] Supabase client: Initializing with URL:', supabaseUrl)
    supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey)
    console.log('[DEBUG] Supabase client: Successfully created')
    return supabaseInstance
  } catch (error) {
    console.error("[ERROR] Error creating Supabase client:", error)
    return null
  }
}

// Default export for compatibility
export default createClient
