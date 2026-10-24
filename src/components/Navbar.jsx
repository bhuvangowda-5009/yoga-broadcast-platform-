import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar({ user, profile, onLogout }) {
  return (
    <nav style={{ padding: '1rem 2rem', background: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem' }}>
        🧘 YogaLive
      </Link>
      <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
        <Link to="/" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Home</Link>
        <Link to="/explore" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Sessions</Link>
        <Link to="/pricing" style={{ color: '#fbbf24', textDecoration: 'none' }}>Plans (Payment)</Link>
        
        {(profile?.role === 'coordinator' || profile?.role === 'admin') && (
          <Link to="/coordinator" style={{ color: '#38bdf8', textDecoration: 'none' }}>Coordinator</Link>
        )}
        {profile?.role === 'admin' && (
          <Link to="/admin" style={{ color: '#f87171', textDecoration: 'none' }}>Admin</Link>
        )}

        {user ? (
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              {profile?.full_name || user.email} <strong style={{ color: '#38bdf8' }}>[{profile?.role || 'subscriber'}]</strong>
            </span>
            <button 
              onClick={onLogout} 
              style={{ padding: '0.4rem 0.8rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" style={{ padding: '0.4rem 0.8rem', background: '#0284c7', color: '#fff', borderRadius: '4px', textDecoration: 'none' }}>
            Login / Sign Up
          </Link>
        )}
      </div>
    </nav>
  );
}