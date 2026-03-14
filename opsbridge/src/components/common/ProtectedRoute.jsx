import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

/**
 * Wraps routes that require authentication and a specific role.
 *
 * Usage:
 *   <ProtectedRoute requiredRole="manager">
 *     <MyPage />
 *   </ProtectedRoute>
 *
 * - If not logged in → redirect to /login
 * - If wrong role → redirect to their correct dashboard
 * - If still loading → show spinner
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner message="正在验证身份..." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Profile not yet loaded — rare edge case, show spinner
  if (!profile) {
    return <LoadingSpinner message="正在加载..." />
  }

  // User is logged in but is trying to access the wrong role's area
  if (profile.role !== requiredRole) {
    const correctPath = profile.role === 'manager'
      ? '/manager/dashboard'
      : '/worker/dashboard'
    return <Navigate to={correctPath} replace />
  }

  return children
}
