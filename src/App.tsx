import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLogin } from './components/AdminLogin';
import { UserLogin } from './components/UserLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { UserDashboard } from './components/UserDashboard';
import { SiteImages } from './components/SiteImages';
import { SiteMap } from './components/SiteMap';
import SiteDetails from './components/SiteDetails';
import { useAuthStore } from './store/authStore';

function ProtectedRoute({ 
  children, 
  requiredRole 
}: { 
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}) {
  const { user, loading } = useAuthStore(state => ({ 
    user: state.user, 
    loading: state.loading 
  }));

  if (loading) return <div>Loading...</div>; // Prevents redirecting before auth check completes

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  const fetchUser = useAuthStore(state => state.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/user/login" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/user/login" element={<UserLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/site-images"
          element={
            <ProtectedRoute>
              <SiteImages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/site-map"
          element={
            <ProtectedRoute>
              <SiteMap />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sites/:siteId"
          element={
            <ProtectedRoute requiredRole="admin">
              <SiteDetails />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
