import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'

// Pages
import LoginPage from './pages/auth/LoginPage'
import ManagerDashboard from './pages/manager/ManagerDashboard'
import WorkerDashboard from './pages/worker/WorkerDashboard'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Manager routes — only accessible if role = 'manager' */}
        <Route
          path="/manager/*"
          element={
            <ProtectedRoute requiredRole="manager">
              <Routes>
                <Route path="dashboard" element={<ManagerDashboard />} />
                {/* Phase 2: task creation will be added here */}
                {/* <Route path="tasks/new" element={<TaskCreatePage />} /> */}
              </Routes>
            </ProtectedRoute>
          }
        />

        {/* Worker routes — only accessible if role = 'worker' */}
        <Route
          path="/worker/*"
          element={
            <ProtectedRoute requiredRole="worker">
              <Routes>
                <Route path="dashboard" element={<WorkerDashboard />} />
                {/* Phase 3: task detail will be added here */}
                {/* <Route path="tasks/:id" element={<TaskDetailPage />} /> */}
              </Routes>
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}
