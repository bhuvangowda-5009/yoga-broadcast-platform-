import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, profile, subscription, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout(e) {
    e.preventDefault();
    try {
      await signOut();
    } catch (err) {
      console.warn('Logout hook warning:', err);
    } finally {
      navigate('/login', { replace: true });
    }
  }

  const role = profile?.role || 'subscriber';

  function renderRoleBadge() {
    if (role === 'admin') {
      return (
        <span style={{
          fontSize: '0.68rem',
          fontWeight: '900',
          letterSpacing: '0.6px',
          color: '#fb7185',
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.35)',
          padding: '2px 8px',
          borderRadius: '4px',
          marginTop: '2px'
        }}>
          🛡️ CHIEF ADMIN
        </span>
      );
    }

    if (role === 'instructor') {
      return (
        <span style={{
          fontSize: '0.68rem',
          fontWeight: '900',
          letterSpacing: '0.6px',
          color: '#34d399',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          padding: '2px 8px',
          borderRadius: '4px',
          marginTop: '2px'
        }}>
          🧘 FACULTY STAFF
        </span>
      );
    }

    if (role === 'coordinator') {
      return (
        <span style={{
          fontSize: '0.68rem',
          fontWeight: '900',
          letterSpacing: '0.6px',
          color: '#c084fc',
          background: 'rgba(168, 85, 247, 0.15)',
          border: '1px solid rgba(168, 85, 247, 0.35)',
          padding: '2px 8px',
          borderRadius: '4px',
          marginTop: '2px'
        }}>
          📋 COORDINATOR
        </span>
      );
    }

    const hasPaid = !!subscription;
    return (
      <span style={{
        fontSize: '0.66rem',
        fontWeight: '800',
        letterSpacing: '0.6px',
        color: hasPaid ? '#38bdf8' : '#f87171',
        background: hasPaid ? 'rgba(56, 189, 248, 0.15)' : 'rgba(248, 113, 113, 0.12)',
        border: hasPaid ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(248, 113, 113, 0.25)',
        padding: '2px 7px',
        borderRadius: '4px',
        marginTop: '2px'
      }}>
        {hasPaid ? 'ACTIVE PASS' : 'NO ACTIVE PASS'}
      </span>
    );
  }

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(9, 13, 22, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '0.85rem 2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* BRAND IDENTITY */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: '900',
            fontSize: '1.1rem',
            boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)'
          }}>
            ॐ
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.5px' }}>
            Yoga<span style={{ color: '#38bdf8' }}>Live</span>
          </span>
        </Link>

        {/* PRIMARY ROUTE LINKS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.6rem' }}>
          <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.86rem', fontWeight: '600' }}>
            Home
          </Link>
          <Link to="/library" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.86rem', fontWeight: '600' }}>
            Library
          </Link>
          <Link to="/today" style={{ color: '#f8fafc', textDecoration: 'none', fontSize: '0.86rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444' }}></span>
            Today's Practice
          </Link>

          {role === 'subscriber' && (
            <Link to="/pricing" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.86rem', fontWeight: '600' }}>
              Pricing
            </Link>
          )}

          {user && (
            <Link to="/profile" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.86rem', fontWeight: '600' }}>
              Profile
            </Link>
          )}

          {role === 'instructor' && (
            <Link to="/instructor" style={{ color: '#10b981', textDecoration: 'none', fontSize: '0.82rem', fontWeight: '800', padding: '4px 10px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '6px' }}>
              Instructor Studio
            </Link>
          )}
          {role === 'coordinator' && (
            <Link to="/coordinator" style={{ color: '#a855f7', textDecoration: 'none', fontSize: '0.82rem', fontWeight: '800', padding: '4px 10px', background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '6px' }}>
              Coordinator Desk
            </Link>
          )}
          {role === 'admin' && (
            <Link to="/admin" style={{ color: '#f43f5e', textDecoration: 'none', fontSize: '0.82rem', fontWeight: '800', padding: '4px 10px', background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '6px' }}>
              Admin Panel
            </Link>
          )}
        </div>

        {/* AUTH STATE CAPSULE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#f8fafc' }}>
                  {profile?.name || user.email.split('@')[0]}
                </span>
                {renderRoleBadge()}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#f8fafc',
                  padding: '7px 15px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => (e.target.style.background = 'rgba(239, 68, 68, 0.25)')}
                onMouseLeave={(e) => (e.target.style.background = 'rgba(255, 255, 255, 0.08)')}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/login" style={{ color: '#f8fafc', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '700', padding: '8px 16px' }}>
                Sign In
              </Link>
              <Link to="/signup" style={{ background: '#0284c7', color: '#fff', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '800', padding: '8px 18px', borderRadius: '8px', boxShadow: '0 0 15px rgba(2, 132, 199, 0.4)' }}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}