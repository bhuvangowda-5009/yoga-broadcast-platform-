import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, profile, subscription, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <nav style={{ padding: '0.8rem 2rem', background: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'sans-serif' }}>
      <Link to="/" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.25rem' }}>
        🧘 YogaLive
      </Link>

      <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
        <Link to="/" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Home</Link>
        <Link to="/library" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Library</Link>
        <Link to="/today" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Today's Practice</Link>
        <Link to="/pricing" style={{ color: '#fbbf24', textDecoration: 'none' }}>Pricing</Link>

        {user ? (
          <>
            <Link to="/profile" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Profile & Streak</Link>

            {profile?.role === 'instructor' && (
              <Link to="/instructor" style={{ color: '#34d399', textDecoration: 'none', fontWeight: 'bold' }}>Instructor Studio</Link>
            )}
            {profile?.role === 'coordinator' && (
              <Link to="/coordinator" style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 'bold' }}>Coordinator Panel</Link>
            )}
            {profile?.role === 'admin' && (
              <Link to="/admin" style={{ color: '#f87171', textDecoration: 'none', fontWeight: 'bold' }}>Admin Panel</Link>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginLeft: '0.8rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                {profile?.name || user.email}
                <span style={{ marginLeft: '4px', padding: '2px 6px', borderRadius: '4px', background: subscription ? '#166534' : '#854d0e', color: '#fff', fontSize: '0.7rem' }}>
                  {subscription ? 'ACTIVE PASS' : 'NO PLAN'}
                </span>
              </span>
              <button onClick={handleLogout} style={{ padding: '0.35rem 0.75rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Logout
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <Link to="/login" style={{ padding: '0.4rem 0.8rem', background: '#0284c7', color: '#fff', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
              Login
            </Link>
            <Link to="/signup" style={{ padding: '0.4rem 0.8rem', background: '#334155', color: '#fff', borderRadius: '4px', textDecoration: 'none' }}>
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}