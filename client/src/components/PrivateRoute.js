import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is trying to access the correct dashboard based on their role
  const isMcpRoute = location.pathname.startsWith('/mcp');
  const isPartnerRoute = location.pathname.startsWith('/partner');

  if (user.role === 'mcp' && isPartnerRoute) {
    return <Navigate to="/mcp/dashboard" replace />;
  }

  if (user.role === 'partner' && isMcpRoute) {
    return <Navigate to="/partner/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute; 