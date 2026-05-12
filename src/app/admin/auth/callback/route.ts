import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { env } from '@/lib/env'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Second gate: verify the logged-in email matches the allowed admin email
      if (data.user.email?.toLowerCase() === env.ADMIN_EMAIL.toLowerCase()) {
        return NextResponse.redirect(`${origin}/admin`)
      }
      // Wrong email — sign them out immediately
      await supabase.auth.signOut()
    }
  }

  return NextResponse.redirect(`${origin}/admin/login?error=auth_failed`)
}
