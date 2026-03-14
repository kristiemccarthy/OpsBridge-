// Worker Task Detail page — Phase 3 placeholder.
// The full SOP step-through flow will be built here in Phase 3.

import { createClient } from '@/lib/supabase/server'
import { redirect }     from 'next/navigation'

export default async function TaskDetailPage({ params }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: task } = await supabase
    .from('tasks')
    .select('*, sop_steps(*)')
    .eq('id', params.id)
    .eq('assigned_worker_id', user.id)   // security: workers can only see their own tasks
    .single()

  if (!task) redirect('/worker/dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white px-4 py-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <a href="/worker/dashboard" className="text-blue-200 hover:text-white" lang="zh-CN">
            ← 返回
          </a>
          <h1 className="text-lg font-bold" lang="zh-CN">任务详情</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        <div className="card">
          <h2 className="text-xl font-bold" lang="zh-CN">
            {task.title_zh || task.title_en}
          </h2>
          {task.title_zh && (
            <p className="text-gray-400 text-sm mt-1">{task.title_en}</p>
          )}
          {task.description_zh && (
            <p className="text-gray-600 mt-3" lang="zh-CN">{task.description_zh}</p>
          )}
        </div>

        {/* SOP Steps preview */}
        {task.sop_steps?.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-gray-700 mb-3" lang="zh-CN">操作步骤</h3>
            <ol className="space-y-3">
              {task.sop_steps
                .sort((a, b) => a.step_number - b.step_number)
                .map(step => (
                  <li key={step.id} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700
                                     text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {step.step_number}
                    </span>
                    <p className="text-gray-700" lang="zh-CN">
                      {step.instruction_zh || step.instruction_en}
                    </p>
                  </li>
                ))}
            </ol>
          </div>
        )}

        <div className="card bg-blue-50 border-blue-100 text-center py-4">
          <p className="text-sm text-blue-700 font-medium">🚧 Phase 3</p>
          <p className="text-xs text-blue-500 mt-1">
            Step-by-step completion flow coming in Phase 3.
          </p>
        </div>
      </main>
    </div>
  )
}
