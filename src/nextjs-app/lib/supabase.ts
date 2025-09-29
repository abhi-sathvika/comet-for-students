import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: number
  name: string
  email: string
  created_at: string
}

export interface Group {
  id: number
  group_name: string
  description: string
  created_at: string
}

export interface Click {
  id?: number
  user_id: number
  group_id: number
  timestamp?: string
  session_id?: string
  page_url?: string
}