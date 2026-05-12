import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Admin Panel</h1>
          <form action="/admin/auth/signout" method="post">
            <button
              type="submit"
              className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
        <p className="text-slate-400 text-sm">Signed in as {user.email}</p>
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <p className="text-slate-400">
            Project management UI coming in Phase 3.
          </p>
        </div>
      </div>
    </main>
  )
}
