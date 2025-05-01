import { createClient } from "@supabase/supabase-js"

// Check if environment variables are defined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables. Check your .env.local file.")
}

// Create a singleton instance of the Supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const getSupabase = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key are required. Check your environment variables.")
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }

  return supabaseInstance
}

// For backward compatibility
export const supabase = typeof window !== "undefined" ? getSupabase() : null
