import { useAuth } from '../../context/AuthContext'

/**
 * Worker Dashboard — Phase 1 placeholder.
 * Phase 3 will replace this with the full Chinese-language task view.
 */
export default function WorkerDashboard() {
  const { profile, signOut } = useAuth()

  const greeting = profile?.name_zh
    ? `你好，${profile.name_zh}！`
    : `你好，${profile?.name_en}！`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-brand-700 text-white px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold" lang="zh-CN">工厂任务</h1>
          <p className="text-brand-200 text-xs">OpsBridge Worker</p>
        </div>
        <button
          onClick={signOut}
          className="text-xs bg-brand-800 hover:bg-brand-900 px-3 py-1.5 rounded-lg transition-colors"
          lang="zh-CN"
        >
          退出
        </button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* Greeting */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-xl font-bold text-gray-800" lang="zh-CN">{greeting}</p>
          <p className="text-gray-500 text-sm mt-1" lang="zh-CN">
            今天的班次：{profile?.shifts?.name ?? '—'}
          </p>
        </div>

        {/* Phase 1 placeholder */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-800 font-medium" lang="zh-CN">任务列表即将开放</p>
          <p className="text-gray-400 text-sm mt-1">Task list coming in Phase 3</p>
          <div className="mt-4 text-xs text-gray-400 bg-gray-50 rounded-xl p-3 text-left space-y-1">
            <p>✅ 登录系统正常 / Auth working</p>
            <p>⏳ 任务列表 / Task list — Phase 3</p>
            <p>⏳ 徽章系统 / Badges — Phase 5</p>
          </div>
        </div>
      </main>
    </div>
  )
}
