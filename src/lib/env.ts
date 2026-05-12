import { z } from 'zod'

const envSchema = z.object({
  // Public (safe to expose to client)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),

  // Server-only (never NEXT_PUBLIC_)
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-', 'ANTHROPIC_API_KEY must start with sk-ant-'),
  ADMIN_EMAIL: z.string().email('ADMIN_EMAIL must be a valid email'),
  WEBHOOK_SECRET: z.string().min(20).optional(),

  // Optional — empty string treated as absent (process.env sets '' not undefined for KEY=)
  VOYAGE_API_KEY: z.string().min(1).optional().or(z.literal('')).transform(v => v || undefined),
  RESEND_API_KEY: z.string().startsWith('re_').optional().or(z.literal('')).transform(v => v || undefined),
  CLOUDFLARE_ANALYTICS_TOKEN: z.string().min(1).optional().or(z.literal('')).transform(v => v || undefined),
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error('Environment variable validation failed:')
  _env.error.issues.forEach(issue => {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`)
  })
  throw new Error('Missing or invalid environment variables. Check .env.local against .env.local.example')
}

export const env = _env.data
