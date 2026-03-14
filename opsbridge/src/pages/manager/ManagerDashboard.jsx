import { useAuth } from '../../context/AuthContext'

/**
 * Manager Dashboard — Phase 1 placeholder.
 * Phase 2 will replace this with a real task list + filters.
 */
export default function ManagerDashboard() {
  const { profile, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-brand-700 text-white px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">OpsBridge</h1>
          <p className="text-brand-200 text-xs">Manager Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-brand-100">{profile?.name_en}</span>
          <button
            onClick={signOut}
            className="text-xs bg-brand-800 hover:bg-brand-900 px-3 py-1.5 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Phase 1 placeholder card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
          <div className="text-4xl mb-3">🏭</div>
          <h2 className="text-lg font-semibold text-gray-800">Manager Dashboard</h2>
          <p className="text-gray-500 text-sm mt-1">
            Phase 1 complete. Task list coming in Phase 2.
          </p>
          <div className="mt-4 text-xs text-gray-400 bg-gray-50 rounded-xl p-3 text-left space-y-1">
            <p>✅ Auth system working</p>
            <p>✅ Role-based routing active</p>
            <p>⏳ Task creation — Phase 2</p>
            <p>⏳ Worker view — Phase 3</p>
          </div>
        </div>

        {/* Worker info card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Your Profile</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Name</span>
              <span className="font-medium">{profile?.name_en}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Role</span>
              <span className="font-medium capitalize">{profile?.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shift</span>
              <span className="font-medium">{profile?.shifts?.name ?? '—'}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
