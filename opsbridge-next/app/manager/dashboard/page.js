// Manager Dashboard — Server Component (no 'use client' needed).
// Next.js runs this on the server, fetches data, and sends ready-made HTML
// to the browser. This is faster than fetching data in the browser.

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SignOutButton from '@/components/ui/SignOutButton'

export const metadata = { title: 'Manager Dashboard — OpsBridge' }

export default async function ManagerDashboard() {
  const supabase = await createClient()

  // Get logged-in user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get their profile (name, role, shift)
  const { data: profile } = await supabase
    .from('workers')
    .select('*, shifts(name)')
    .eq('id', user.id)
    .single()

  // Get all tasks with worker and shift info
  const { data: tasks = [] } = await supabase
    .from('tasks')
    .select('*, workers!assigned_worker_id(name_en, name_zh), shifts(name)')
    .order('created_at', { ascending: false })

  // Count tasks by status for the summary row
  const counts = {
    pending:     tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed:   tasks.filter(t => t.status === 'completed').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top navigation bar */}
      <header className="bg-blue-700 text-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">OpsBridge</h1>
            <p className="text-blue-200 text-xs">Manager — {profile?.name_en}</p>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">

        {/* Summary counts */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Pending"     value={counts.pending}     color="gray" />
          <StatCard label="In Progress" value={counts.in_progress} color="blue" />
          <StatCard label="Completed"   value={counts.completed}   color="green" />
        </div>

        {/* New Task button */}
        <a
          href="/manager/tasks/new"
          className="block w-full text-center bg-blue-600 hover:bg-blue-700
                     text-white font-semibold py-3 rounded-xl transition-colors"
        >
          + New Task / 新任务
        </a>

        {/* Task list */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            All Tasks ({tasks.length})
          </h2>

          {tasks.length === 0 ? (
            <div className="card text-center text-gray-400 py-8">
              <p>No tasks yet.</p>
              <p lang="zh-CN" className="text-sm mt-1">还没有任务。点击上方"新任务"开始。</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {tasks.map(task => (
                <li key={task.id} className="card">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {/* English title */}
                      <p className="font-medium text-gray-900 truncate">{task.title_en}</p>
                      {/* Chinese title */}
                      {task.title_zh && (
                        <p className="text-gray-500 text-sm mt-0.5" lang="zh-CN">
                          {task.title_zh}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {/* Worker assigned */}
                        <span className="text-xs text-gray-400">
                          → {task.workers?.name_en ?? 'Unassigned'}
                        </span>
                        {/* Shift */}
                        <span className="text-xs text-gray-400">
                          {task.shifts?.name}
                        </span>
                        {/* Due time */}
                        {task.due_time && (
                          <span className="text-xs text-gray-400">⏰ {task.due_time}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {/* Status badge */}
                      <span className={`badge-${task.status}`}>
                        {statusLabel(task.status)}
                      </span>
                      {/* Priority dot */}
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <span className={`dot-${task.priority}`} />
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Phase 1 progress note */}
        <div className="card bg-blue-50 border-blue-100 text-center py-4">
          <p className="text-sm text-blue-700 font-medium">Phase 1 complete ✅</p>
          <p className="text-xs text-blue-500 mt-1">Task creation (Phase 2) coming next.</p>
        </div>

      </main>
    </div>
  )
}

// Small stat summary card
function StatCard({ label, value, color }) {
  const colors = {
    gray:  'bg-gray-50  border-gray-200  text-gray-700',
    blue:  'bg-blue-50  border-blue-200  text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
  }
  return (
    <div className={`rounded-xl border p-3 text-center ${colors[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-0.5">{label}</p>
    </div>
  )
}

// Human-readable status labels
function statusLabel(status) {
  return { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed' }[status] ?? status
}
