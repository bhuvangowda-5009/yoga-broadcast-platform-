import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles, requirePaid = false }) {
  const { user, profile, subscription, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center', fontFamily: 'sans-serif' }}>Verifying Credentials...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(profile?.role)) {
    return <Navigate to="/today" replace />;
  }

  if (requirePaid && !subscription && profile?.role === 'subscriber') {
    return <Navigate to="/pricing" replace />;
  }

  return children;
}