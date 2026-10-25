import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Library from './pages/Library';
import Today from './pages/Today';
import Pricing from './pages/Pricing';
import Profile from './pages/Profile';
import Instructor from './pages/Instructor';
import Coordinator from './pages/Coordinator';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Signup from './pages/Signup';

export default function App() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(ellipse at 50% 0%, #172554 0%, #090d16 60%, #030712 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color: '#f8fafc'
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '900',
            fontSize: '1.4rem',
            color: '#fff',
            boxShadow: '0 0 25px rgba(6, 182, 212, 0.5)',
            marginBottom: '1.2rem'
          }}
        >
          ॐ
        </div>
        <div style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '-0.3px', marginBottom: '0.4rem' }}>
          Yoga<span style={{ color: '#38bdf8' }}>Live</span>
        </div>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
          Initializing synchronous telemetry & security clearances...
        </p>
      </div>
    );
  }

  // Security & RBAC Access Logic
  const isAdmin = profile?.role === 'admin';
  const isApprovedInstructor =
    (profile?.role === 'instructor' && profile?.is_approved === true) || isAdmin;
  const isApprovedCoordinator =
    (profile?.role === 'coordinator' && profile?.is_approved === true) || isAdmin;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#030712',
        color: '#f8fafc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      <Navbar />

      <Routes>
        {/* PUBLIC & GENERAL ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/library" element={<Library />} />
        <Route path="/today" element={<Today />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* SUBSCRIBER PROTECTED ROUTE */}
        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/login" replace />}
        />

        {/* RBAC ROLE PROTECTED ROUTES */}
        <Route
          path="/instructor"
          element={
            isApprovedInstructor ? (
              <Instructor />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/coordinator"
          element={
            isApprovedCoordinator ? (
              <Coordinator />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/admin"
          element={
            isAdmin ? (
              <Admin />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* CATCH-ALL ROUTE */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}