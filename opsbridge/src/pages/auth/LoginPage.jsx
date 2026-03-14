import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { signIn, profile } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(email, password)
      // AuthContext will update profile; redirect based on role
      // We use a small delay to let AuthContext finish fetching profile
      // In Phase 1, replace this with a proper onAuthStateChange redirect
      toast.success('登录成功 / Signed in')
    } catch (err) {
      toast.error(err.message || '登录失败 / Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  // Redirect once profile is loaded after sign-in
  if (profile) {
    const dest = profile.role === 'manager' ? '/manager/dashboard' : '/worker/dashboard'
    navigate(dest, { replace: true })
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {/* App title — English + Chinese */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-brand-700 tracking-tight">OpsBridge</h1>
          <p className="text-gray-500 text-sm mt-1" lang="zh-CN">工厂任务管理系统</p>
          <p className="text-gray-400 text-xs">Factory Task Management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base
                         focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password / 密码
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base
                         focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-2"
          >
            {loading ? '登录中...' : '登录 / Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Contact your manager if you need access.<br />
          <span lang="zh-CN">如需访问权限，请联系您的管理员。</span>
        </p>
      </div>
    </div>
  )
}
