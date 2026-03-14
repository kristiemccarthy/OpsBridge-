'use client'
// This button needs 'use client' because clicking it triggers an action.

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignOutButton({ label = 'Sign Out' }) {
  const router   = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-xs bg-blue-800 hover:bg-blue-900 text-white
                 px-3 py-1.5 rounded-lg transition-colors"
      lang="zh-CN"
    >
      {label}
    </button>
  )
}
