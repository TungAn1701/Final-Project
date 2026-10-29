import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, ROLES } from '../../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based protection: seamlessly redirect to the user's authorized home workspace
  if (allowedRoles && !hasRole(allowedRoles)) {
    if (user?.role === ROLES.CUSTOMER) {
      // Patient/Customer is redirected to their personal profile & session history
      return <Navigate to="/my-profile" replace />;
    }
    if (user?.role === ROLES.CLINICIAN || user?.role === ROLES.TECHNICIAN) {
      // Clinical staff is redirected to the patients directory
      return <Navigate to="/patients" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};
