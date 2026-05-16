import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export function createSupabaseMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({ request })

  // Read at request time. On Cloudflare Workers, OpenNext's shim populates
  // process.env from runtime bindings when handling each request; module-level
  // reads run at cold start (before the shim) and capture undefined.
  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'] ?? ''
  const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ?? ''

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  return { supabase, response }
}
