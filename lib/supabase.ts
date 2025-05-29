import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface User {
  id: string
  email: string
  full_name?: string
  telegram_chat_id?: string
  telegram_notifications_enabled: boolean
  reminder_notifications_enabled: boolean
  creation_notifications_enabled: boolean
  created_at: string
  updated_at: string
}

export interface DatabaseEvent {
  id: string
  user_id: string
  title: string
  description?: string
  event_date: string
  start_time: string
  end_time: string
  location?: string
  color: string
  reminder_minutes: number
  reminder_sent: boolean
  created_at: string
  updated_at: string
}
