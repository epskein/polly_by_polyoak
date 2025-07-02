import { createClient } from "@supabase/supabase-js"
import type { Database } from "../types/database.types"

// It's recommended to use a .env.local file to store these values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL and anonymous key are required. Make sure to set them in your .env.local file.")
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // This is set to false to meet the requirement that all users must sign in every time.
    persistSession: false,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Helper function to get current user
export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// Helper function to get session
export const getSession = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}
