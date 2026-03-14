'use client'
// 'use client' means this file runs in the browser, not on the server.
// We need it here because this page uses forms and button clicks.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  async function handleSignIn(e) {
    e.preventDefault()   // stops the browser from refreshing the page on submit
    setLoading(true)
    setError(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError('登录失败。请检查您的邮箱和密码。\nSign in failed. Please check your email and password.')
      setLoading(false)
      return
    }

    // Fetch this worker's role so we can redirect to the right dashboard
    const { data: { user } } = await supabase.auth.getUser()
    const { data: worker }   = await supabase
      .from('workers')
      .select('role')
      .eq('id', user.id)
      .single()

    if (worker?.role === 'manager') {
      router.push('/manager/dashboard')
    } else {
      router.push('/worker/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">

        {/* App logo / title area */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏭</div>
          <h1 className="text-2xl font-bold text-blue-700">OpsBridge</h1>
          <p className="text-gray-500 text-sm mt-1" lang="zh-CN">工厂任务管理系统</p>
          <p className="text-gray-400 text-xs">Factory Task Management</p>
        </div>

        {/* Login form */}
        <div className="card">
          <form onSubmit={handleSignIn} className="space-y-4">

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
                placeholder="your@email.com"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password / <span lang="zh-CN">密码</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="input"
              />
            </div>

            {/* Show error message if login fails */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm whitespace-pre-line">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-2"
            >
              {loading ? '登录中...' : '登录 / Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-5">
            Need access? Contact your manager.<br />
            <span lang="zh-CN">需要访问权限？请联系您的管理员。</span>
          </p>
        </div>

      </div>
    </div>
  )
}
