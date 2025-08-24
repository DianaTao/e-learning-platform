import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { AuthPage } from '@/pages/AuthPage';
import { CourseDashboard } from '@/pages/CourseDashboard';
import { AssignmentTracker } from '@/pages/AssignmentTracker';
import { ProgressAnalytics } from '@/pages/ProgressAnalytics';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';

function App() {
  const { initializeAuth } = useAuthStore();
  const { initializeTheme } = useThemeStore();

  useEffect(() => {
    initializeAuth();
    initializeTheme();
  }, [initializeAuth, initializeTheme]);

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<AuthPage />} />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <CourseDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/assignments"
          element={
            <ProtectedRoute>
              <Layout>
                <AssignmentTracker />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Layout>
                <ProgressAnalytics />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
