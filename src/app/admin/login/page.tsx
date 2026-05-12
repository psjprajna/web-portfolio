'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/admin/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-3">
          <p className="text-slate-100 text-lg font-semibold">Check your email</p>
          <p className="text-slate-400 text-sm">Magic link sent to {email}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950">
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm px-4">
        <h1 className="text-slate-100 text-xl font-semibold text-center">Admin</h1>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="w-full px-4 py-2 rounded bg-slate-800 text-slate-100 border border-slate-700 focus:outline-none focus:border-teal-600"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded bg-teal-700 text-white font-medium hover:bg-teal-600 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Sending…' : 'Send magic link'}
        </button>
      </form>
    </main>
  )
}
