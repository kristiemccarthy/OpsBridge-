import { createClient } from '@supabase/supabase-js'

// These values come from your .env file
// VITE_ prefix is required by Vite to expose env vars to the browser
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Copy .env.example to .env and fill in your Supabase URL and anon key.'
  )
}

// This is the main Supabase client used throughout the app
// Import this wherever you need to read/write data or check auth
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
