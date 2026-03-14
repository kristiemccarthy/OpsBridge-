import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

// AuthContext stores the current user and their profile (including role)
// Any component in the app can call useAuth() to access this
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)   // Supabase auth user object
  const [profile, setProfile] = useState(null)   // Row from our "workers" table
  const [loading, setLoading] = useState(true)   // True while checking session

  useEffect(() => {
    // Check if a session already exists (e.g. user refreshed the page)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user)
          fetchProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Fetch the worker's profile row (which contains their role, name, shift, etc.)
  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('workers')
      .select('*, shifts(*)')      // Also fetch the linked shift data
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching worker profile:', error.message)
    } else {
      setProfile(data)
    }
    setLoading(false)
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook — call useAuth() anywhere in the app to access auth state
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
