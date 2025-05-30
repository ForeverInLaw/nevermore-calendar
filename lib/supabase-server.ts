import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"

// Check if we have valid credentials
const isValidUrl = supabaseUrl && !supabaseUrl.includes("your_supabase_url_here")

export const createServerClient = () => {
  if (!isValidUrl) {
    // Return a mock client for preview mode
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
      },
    } as any
  }

  const cookieStore = cookies()

  return createClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })
}
