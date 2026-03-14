// Worker Dashboard — entirely in Simplified Chinese.
// This is a Server Component: Next.js fetches data on the server
// and sends ready HTML to the browser (fast, even on slow phones).

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SignOutButton from '@/components/ui/SignOutButton'

export const metadata = { title: '工作台 — OpsBridge' }

export default async function WorkerDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get the worker's profile
  const { data: profile } = await supabase
    .from('workers')
    .select('*, shifts(name)')
    .eq('id', user.id)
    .single()

  // Get tasks assigned to this worker, ordered by priority (high first) then due time
  const { data: tasks = [] } = await supabase
    .from('tasks')
    .select('*, sop_steps(id)')
    .eq('assigned_worker_id', user.id)
    .order('priority', { ascending: false })
    .order('due_time',  { ascending: true })

  const completedCount  = tasks.filter(t => t.status === 'completed').length
  const remainingCount  = tasks.filter(t => t.status !== 'completed').length
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

  // Use Chinese name if available, fall back to English
  const displayName = profile?.name_zh || profile?.name_en || '工人'

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header — all Chinese */}
      <header className="bg-blue-700 text-white px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold" lang="zh-CN">工厂任务</h1>
            <p className="text-blue-200 text-xs" lang="zh-CN">{profile?.shifts?.name}</p>
          </div>
          <SignOutButton label="退出" />
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">

        {/* Greeting */}
        <div className="card text-center pt-6 pb-5">
          <p className="text-xl font-bold text-gray-900" lang="zh-CN">
            你好，{displayName}！
          </p>
          <p className="text-gray-500 text-sm mt-1" lang="zh-CN">今天的任务：</p>

          {/* Progress bar */}
          <div className="mt-3 mx-auto max-w-xs">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span lang="zh-CN">已完成 {completedCount}</span>
              <span lang="zh-CN">剩余 {remainingCount}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{progressPercent}% 完成</p>
          </div>
        </div>

        {/* All shift tasks completed! */}
        {tasks.length > 0 && remainingCount === 0 && (
          <div className="card bg-green-50 border-green-200 text-center py-6">
            <p className="text-3xl">🎉</p>
            <p className="text-green-700 font-bold text-lg mt-2" lang="zh-CN">
              所有任务完成！
            </p>
            <p className="text-green-600 text-sm mt-1" lang="zh-CN">
              干得好！
            </p>
          </div>
        )}

        {/* Task list */}
        {tasks.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-400" lang="zh-CN">今天没有分配的任务。</p>
            <p className="text-gray-300 text-sm mt-1">No tasks assigned for today.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {tasks.map(task => (
              <li key={task.id}>
                {/* Each task is a link — will go to task detail page in Phase 3 */}
                <a
                  href={`/worker/tasks/${task.id}`}
                  className="card block active:scale-[0.98] transition-transform cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Chinese title — primary */}
                      <p className="font-semibold text-gray-900" lang="zh-CN">
                        {task.title_zh || task.title_en}
                      </p>
                      {/* English title — secondary, smaller */}
                      {task.title_zh && (
                        <p className="text-gray-400 text-xs mt-0.5">{task.title_en}</p>
                      )}
                      {/* Steps count + due time */}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        {task.sop_steps?.length > 0 && (
                          <span lang="zh-CN">📋 {task.sop_steps.length} 个步骤</span>
                        )}
                        {task.due_time && <span>⏰ {task.due_time}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {/* Status */}
                      <span className={`badge-${task.status}`} lang="zh-CN">
                        {zhStatus(task.status)}
                      </span>
                      {/* Priority dot */}
                      <span className={`dot-${task.priority}`} title={task.priority} />
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}

        {/* Phase 1 note */}
        <div className="card bg-blue-50 border-blue-100 text-center py-3">
          <p className="text-xs text-blue-600">
            Phase 1 complete ✅ — Task detail page coming in Phase 3.
          </p>
        </div>

      </main>
    </div>
  )
}

// Chinese status labels for workers
function zhStatus(status) {
  return { pending: '待开始', in_progress: '进行中', completed: '已完成' }[status] ?? status
}
