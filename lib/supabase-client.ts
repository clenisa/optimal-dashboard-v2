import { createBrowserClient } from "@supabase/ssr"

let supabaseInstance: any = null

export function createClient() {
  if (supabaseInstance) {
    console.log("🔍 [DEBUG] createClient: Returning existing Supabase instance")
    return supabaseInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log("🔍 [DEBUG] createClient: Environment variables check:")
  console.log("🔍 [DEBUG] createClient: SUPABASE_URL exists:", !!supabaseUrl)
  console.log("🔍 [DEBUG] createClient: SUPABASE_ANON_KEY exists:", !!supabaseAnonKey)

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ [DEBUG] Missing Supabase environment variables")
    console.error("❌ [DEBUG] SUPABASE_URL:", supabaseUrl ? "Set" : "Missing")
    console.error("❌ [DEBUG] SUPABASE_ANON_KEY:", supabaseAnonKey ? "Set" : "Missing")
    return null
  }

  try {
    console.log("🔍 [DEBUG] createClient: Creating new Supabase client")
    supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey)
    console.log("🔍 [DEBUG] createClient: Supabase client created successfully")
    return supabaseInstance
  } catch (error) {
    console.error("❌ [DEBUG] Error creating Supabase client:", error)
    return null
  }
}

// Default export for compatibility
export default createClient
