import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';
import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import UserManagement from '../pages/UserManagement';
import ProjectManagement from '../pages/ProjectManagement';
import ProjectData from '../pages/ProjectData';
import UploadImage from '../pages/UploadImage';
import ViewAuditTrail from '../pages/ViewAuditTrail';
import ChangePasswordModal from './ChangePasswordModal';

// Layout component for authenticated pages (with navbar)
const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { mustChangePassword, setMustChangePassword, user } = useAuth();

  const handlePasswordChangeSuccess = () => {
    setMustChangePassword(false);
  };

  return (
    <div className="min-h-screen bg-white font-body">
      <Navbar />
      {children}

      {/* Password Change Modal */}
      <ChangePasswordModal
        isOpen={mustChangePassword}
        onClose={() => {}} // Prevent closing until password is changed
        onSuccess={handlePasswordChangeSuccess}
        username={user?.username || ''}
      />
    </div>
  );
};

// Layout component for public pages (without navbar)
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white font-body">
      {children}
    </div>
  );
};

const AppRouter: React.FC = () => {
  const { isAuthenticated, loading, user } = useAuth();

  const getDefaultRoute = () => {
    const userRole = user?.roles?.[0] || user?.role;
    console.log('AppRouter: Determining default route for user:', {
      userRole,
      canViewAuditTrail: user?.canViewAuditTrail,
      canCreateProjects: user?.canCreateProjects,
      canViewReports: user?.canViewReports,
      user
    });

    // For USER role: always default to Upload Image (their primary function)
    if (userRole === 'USER') {
      return '/upload-image';
    }

    // For REVIEWER role: default to Audit Trail if they have permission
    if (userRole === 'REVIEWER') {
      if (user?.canViewAuditTrail === true) {
        return '/view-audit-trail';
      }
      return '/project-data'; // Fallback if no audit trail access
    }

    // For ADMINISTRATOR role: default to User Management
    if (userRole === 'ADMINISTRATOR') {
      return '/user-management';
    }

    // Fallback: redirect to the first available page based on permissions
    if (user?.canViewAuditTrail === true) return '/view-audit-trail';
    if (user?.canCreateProjects === true) return '/project-management';
    if (user?.canViewReports === true) return '/project-data';

    // If user has no specific permissions, redirect to upload image
    return '/upload-image';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-z-ivory to-z-light-green flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes (no navbar) */}
      <Route
        path="/login"
        element={
          <PublicLayout>
            <Login />
          </PublicLayout>
        }
      />

      {/* Protected Routes (with navbar) */}
      <Route
        path="/dashboard"
        element={
          <AuthenticatedLayout>
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </AuthenticatedLayout>
        }
      />

      <Route
        path="/user-management"
        element={
          <AuthenticatedLayout>
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          </AuthenticatedLayout>
        }
      />

      <Route
        path="/project-management"
        element={
          <AuthenticatedLayout>
            <ProtectedRoute>
              <ProjectManagement />
            </ProtectedRoute>
          </AuthenticatedLayout>
        }
      />

      <Route
        path="/project-data"
        element={
          <AuthenticatedLayout>
            <ProtectedRoute>
              <ProjectData />
            </ProtectedRoute>
          </AuthenticatedLayout>
        }
      />

      <Route
        path="/upload-image"
        element={
          <AuthenticatedLayout>
            <ProtectedRoute>
              <UploadImage />
            </ProtectedRoute>
          </AuthenticatedLayout>
        }
      />

      <Route
        path="/view-audit-trail"
        element={
          <AuthenticatedLayout>
            <ProtectedRoute>
              <ViewAuditTrail />
            </ProtectedRoute>
          </AuthenticatedLayout>
        }
      />

      <Route
        path="/profile"
        element={
          <AuthenticatedLayout>
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          </AuthenticatedLayout>
        }
      />

      {/* Default redirect */}
      <Route
        path="/"
        element={
          isAuthenticated ?
            <Navigate to={getDefaultRoute()} replace /> :
            <Navigate to="/login" replace />
        }
      />

      {/* Catch all route */}
      <Route
        path="*"
        element={
          isAuthenticated ?
            <Navigate to={getDefaultRoute()} replace /> :
            <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
};

export default AppRouter;
