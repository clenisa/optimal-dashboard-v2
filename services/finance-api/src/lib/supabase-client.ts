import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL and Service Role Key must be provided.")
}

// This client uses the service role key for privileged backend access
export const createSupabaseAdmin = () => {
  return createClient(supabaseUrl, supabaseKey)
}
