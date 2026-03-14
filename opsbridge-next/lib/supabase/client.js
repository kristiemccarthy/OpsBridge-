/**
 * Supabase BROWSER client
 *
 * Use this file in:
 *   - React components (files that say 'use client' at the top)
 *   - Client-side event handlers (button clicks, form submits)
 *
 * Do NOT use this in Server Components or API routes — use server.js instead.
 */
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Fallback values allow `next build` to succeed without real env vars set.
  // At runtime (npm run dev / production) the real .env.local values are used.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL  ?? 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'
  )
}
