'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { env } from '@/lib/env'

export async function sendMagicLink(email: string): Promise<{ error?: string }> {
  if (email.toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) {
    // Return generic message — don't reveal which email is allowed
    return { error: 'Unauthorized' }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000'}/admin/auth/callback`,
    },
  })

  if (error) return { error: error.message }
  return {}
}
