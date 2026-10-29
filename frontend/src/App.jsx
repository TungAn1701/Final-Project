import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, ROLES } from './context/AuthContext';
import { ProtectedRoute } from './components/Common/ProtectedRoute';
import { AppLayout } from './components/Layout/AppLayout';
import { Login } from './pages/Auth/Login';
import { CustomerList } from './pages/Customers/CustomerList';
import { CustomerDetail } from './pages/Customers/CustomerDetail';
import { GaitSessions } from './pages/Sessions/GaitSessions';
import { MyProfile } from './pages/CustomerPortal/MyProfile';
import { NotFound } from './pages/NotFound';

// Root index redirector based on current user role
const RootRedirector = () => {
  const { isAuthenticated, isCustomer } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return isCustomer ? <Navigate to="/my-profile" replace /> : <Navigate to="/patients" replace />;
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Application Layout */}
          <Route element={<AppLayout />}>
            {/* Root index redirect */}
            <Route path="/" element={<RootRedirector />} />

            {/* Clinician & Technician Routes */}
            <Route
              path="/patients"
              element={
                <ProtectedRoute allowedRoles={[ROLES.CLINICIAN, ROLES.TECHNICIAN]}>
                  <CustomerList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/patients/:id"
              element={
                <ProtectedRoute allowedRoles={[ROLES.CLINICIAN, ROLES.TECHNICIAN]}>
                  <CustomerDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/sessions"
              element={
                <ProtectedRoute allowedRoles={[ROLES.CLINICIAN, ROLES.TECHNICIAN]}>
                  <GaitSessions />
                </ProtectedRoute>
              }
            />

            {/* Customer / Patient Personal Portal Route */}
            <Route
              path="/my-profile"
              element={
                <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
                  <MyProfile />
                </ProtectedRoute>
              }
            />

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
