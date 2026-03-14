/**
 * Next.js Middleware — runs on EVERY page request before the page loads.
 *
 * What this does:
 *  1. Refreshes the Supabase login session so it never expires mid-use
 *  2. Checks if the user is logged in before showing protected pages
 *  3. Redirects to /login if they're not logged in
 *  4. Redirects to the correct dashboard if they try to access the wrong role's pages
 *
 * Think of this as a security guard at the door of every page.
 */
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request })

  // Create a Supabase client that can read/write cookies in middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL  ?? 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — IMPORTANT: do not remove this line
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Public pages anyone can visit (even without logging in)
  const publicPaths = ['/login']
  if (publicPaths.includes(pathname)) {
    // If already logged in, redirect away from login page
    if (user) {
      const role = await getUserRole(supabase, user.id)
      const dest = role === 'manager' ? '/manager/dashboard' : '/worker/dashboard'
      return NextResponse.redirect(new URL(dest, request.url))
    }
    return supabaseResponse
  }

  // Not logged in → send to login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Logged in — check role matches the URL they're visiting
  const role = await getUserRole(supabase, user.id)

  if (pathname.startsWith('/manager') && role !== 'manager') {
    return NextResponse.redirect(new URL('/worker/dashboard', request.url))
  }

  if (pathname.startsWith('/worker') && role !== 'worker') {
    return NextResponse.redirect(new URL('/manager/dashboard', request.url))
  }

  return supabaseResponse
}

// Fetch the worker's role from our database
async function getUserRole(supabase, userId) {
  const { data } = await supabase
    .from('workers')
    .select('role')
    .eq('id', userId)
    .single()
  return data?.role ?? 'worker'
}

// Tell Next.js which URL paths this middleware should run on.
// The regex below means: run on every path EXCEPT Next.js internals and static files.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
