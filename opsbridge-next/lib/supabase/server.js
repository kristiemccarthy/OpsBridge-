/**
 * Supabase SERVER client
 *
 * Use this file in:
 *   - Server Components (default in Next.js App Router)
 *   - API route files (app/api/...)
 *   - middleware.js
 *
 * Next.js runs these on the server, so they can safely read cookies
 * to know which user is logged in.
 */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  // cookies() reads the browser cookies that Next.js receives with each request
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL  ?? 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Components can't set cookies — middleware handles this
          }
        },
      },
    }
  )
}
