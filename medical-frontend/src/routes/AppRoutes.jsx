import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Auth Pages
import Login from '../pages/auth-temp/Login';
import Register from '../pages/auth-temp/Register';

// Dashboard Pages
import AdminDashboard from '../pages/DashBoard/AdminDashBoard';
import DoctorDashboard from '../pages/Dashboard/DoctorDashboard';
//import PharmacistDashboard from '../pages/Dashboard/PharmacistDashboard';
//import ReceptionistDashboard from '../pages/Dashboard/ReceptionistDashboard';
//import PatientDashboard from '../pages/Dashboard/PatientDashboard';

// Other Pages
import NotFound from '../pages/NotFound';
import Unauthorized from '../pages/Unauthorized';

// Protected Route
import ProtectedRoute from './ProtectedRoute';

// User Roles
import { USER_ROLES } from '../utils/Constant';

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  // Helper to get dashboard route based on role
  const getDashboardRoute = () => {
    if (!user || !user.roles || user.roles.length === 0) {
      return '/dashboard/patient';
    }

    const role = user.roles[0]; // Get primary role

    switch (role) {
      case USER_ROLES.ADMIN:
        return '/dashboard/admin';
      case USER_ROLES.DOCTOR:
        return '/dashboard/doctor';
      case USER_ROLES.PHARMACIST:
        return '/dashboard/pharmacist';
      case USER_ROLES.RECEPTIONIST:
        return '/dashboard/receptionist';
      case USER_ROLES.PATIENT:
      default:
        return '/dashboard/patient';
    }
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to={getDashboardRoute()} replace /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to={getDashboardRoute()} replace /> : <Register />} 
        />
      </Route>

      {/* Protected Dashboard Routes */}
      <Route element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        {/* Redirect /dashboard to role-specific dashboard */}
        <Route 
          path="/dashboard" 
          element={<Navigate to={getDashboardRoute()} replace />} 
        />

        {/* Role-specific dashboards */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/doctor"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.DOCTOR]}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/dashboard/pharmacist"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.PHARMACIST]}>
              <PharmacistDashboard />
            </ProtectedRoute>
          }
        /> */}
        {/* <Route
          path="/dashboard/receptionist"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.RECEPTIONIST]}>
              <ReceptionistDashboard />
            </ProtectedRoute>
          }
        /> */}
        {/* <Route
          path="/dashboard/patient"
          element={
            <ProtectedRoute allowedRoles={[USER_ROLES.PATIENT]}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        /> */}
      </Route>

      {/* Home redirect */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? 
            <Navigate to={getDashboardRoute()} replace /> : 
            <Navigate to="/login" replace />
        } 
      />

      {/* Error Pages */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;