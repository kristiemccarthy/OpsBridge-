// New Task page — Phase 2 placeholder.
// The full task creation form (with translation) will be built here in Phase 2.

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = { title: 'New Task — OpsBridge' }

export default async function NewTaskPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch workers and shifts so the form can show dropdowns
  const [{ data: workers = [] }, { data: shifts = [] }] = await Promise.all([
    supabase.from('workers').select('id, name_en, shift_id').eq('role', 'worker'),
    supabase.from('shifts').select('id, name'),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <a href="/manager/dashboard" className="text-blue-200 hover:text-white">← Back</a>
          <h1 className="text-lg font-bold">New Task</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        <div className="card text-center py-10">
          <div className="text-4xl mb-3">🚧</div>
          <h2 className="text-lg font-semibold">Coming in Phase 2</h2>
          <p className="text-gray-500 text-sm mt-2">
            Task creation form with English → Chinese translation will be built here.
          </p>
          <p className="text-xs text-gray-400 mt-4">
            Workers found: {workers.length} | Shifts found: {shifts.length}
          </p>
          <p className="text-xs text-green-600 mt-1">
            ✅ Database is connected and returning data above
          </p>
        </div>
      </main>
    </div>
  )
}
