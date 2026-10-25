import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [selectedRole, setSelectedRole] = useState('subscriber');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { refreshUserData } = useAuth();
  const navigate = useNavigate();

  const roleMeta = {
    subscriber: {
      badge: 'MEMBER PASS',
      tagline: 'Stream daily pranayama and asana sessions live.',
      accent: '#06b6d4',
      glow: 'rgba(6, 182, 212, 0.25)'
    },
    instructor: {
      badge: 'FACULTY STUDIO',
      tagline: 'Transmit high-definition sessions to global practitioners.',
      accent: '#10b981',
      glow: 'rgba(16, 185, 129, 0.25)'
    },
    coordinator: {
      badge: 'LOGISTICS DESK',
      tagline: 'Orchestrate broadcast approvals & subscriber dispatch alerts.',
      accent: '#a855f7',
      glow: 'rgba(168, 85, 247, 0.25)'
    },
    admin: {
      badge: 'COMMAND HQ',
      tagline: 'Governance, access control, and identity permissions.',
      accent: '#f43f5e',
      glow: 'rgba(244, 63, 94, 0.25)'
    }
  };

  function handleRoleTabChange(role) {
    setSelectedRole(role);
    setMsg('');
    if (role === 'admin') {
      setEmail('bhuvan123456789@gmail.com');
    } else {
      setEmail('');
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: prof, error: profErr } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profErr || !prof) {
        await supabase.auth.signOut();
        throw new Error('Authentication profile unreachable. Contact system administrator.');
      }

      const userRole = prof.role || 'subscriber';
      const appliedRole = prof.applied_role;
      const isApproved = prof.is_approved === true;

      if (selectedRole === 'admin') {
        if (userRole !== 'admin') {
          await supabase.auth.signOut();
          throw new Error('Security Breach Alert: Account lacks Master Admin authorization.');
        }
        await refreshUserData(data.user.id);
        navigate('/admin');
        return;
      }

      if (selectedRole === 'instructor' || selectedRole === 'coordinator') {
        if (userRole === 'admin') {
          await refreshUserData(data.user.id);
          navigate(selectedRole === 'instructor' ? '/instructor' : '/coordinator');
          return;
        }

        const matchesRole = userRole === selectedRole || appliedRole === selectedRole;
        if (!matchesRole) {
          await supabase.auth.signOut();
          throw new Error(`Credential mismatch: Access restricted to assigned ${selectedRole}s.`);
        }

        if (!isApproved || userRole !== selectedRole) {
          await supabase.auth.signOut();
          throw new Error(`Verification Pending: Your ${selectedRole.toUpperCase()} credentials await administrative authorization.`);
        }

        await refreshUserData(data.user.id);
        navigate(selectedRole === 'instructor' ? '/instructor' : '/coordinator');
        return;
      }

      await refreshUserData(data.user.id);
      navigate('/today');
    } catch (err) {
      setMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  }

  const currentTheme = roleMeta[selectedRole];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 80% 20%, #1e1b4b 0%, #090d16 60%, #030712 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#f8fafc'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(340px, 440px) minmax(380px, 480px)',
        borderRadius: '24px',
        overflow: 'hidden',
        background: 'rgba(15, 23, 42, 0.65)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px -10px ' + currentTheme.glow,
        transition: 'box-shadow 0.5s ease',
        maxWidth: '960px',
        width: '100%'
      }}>
        {/* LEFT COLUMN: BRAND & SYSTEM TELEMETRY */}
        <div style={{
          padding: '3rem 2.5rem',
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.4) 100%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                fontSize: '1.1rem',
                color: '#fff',
                boxShadow: '0 0 15px rgba(6, 182, 212, 0.5)'
              }}>
                ॐ
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
                Yoga<span style={{ color: '#38bdf8' }}>Live</span>
              </span>
            </div>

            <span style={{
              fontSize: '0.7rem',
              fontWeight: '800',
              letterSpacing: '1.2px',
              padding: '4px 10px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: `1px solid ${currentTheme.accent}`,
              color: currentTheme.accent,
              display: 'inline-block',
              marginBottom: '1rem',
              transition: 'all 0.3s ease'
            }}>
              {currentTheme.badge}
            </span>

            <h1 style={{ fontSize: '2.1rem', fontWeight: '800', lineHeight: 1.15, margin: '0 0 1rem 0', letterSpacing: '-0.8px' }}>
              Elevate your daily rhythm.
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
              {currentTheme.tagline}
            </p>
          </div>

          <div style={{
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '1.2rem',
            marginTop: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#cbd5e1', letterSpacing: '0.5px' }}>STUDIO SERVER STATUS</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
              WebRTC Live Mesh Active • 256-bit Encrypted Stream • Jitsi Gateway Ready
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE AUTH CONTROLS */}
        <div style={{ padding: '3rem 2.8rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* TACTILE PILL SWITCHER */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '4px',
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            marginBottom: '1.8rem'
          }}>
            {['subscriber', 'instructor', 'coordinator', 'admin'].map((r) => {
              const active = selectedRole === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleTabChange(r)}
                  style={{
                    padding: '8px 0',
                    border: 'none',
                    borderRadius: '8px',
                    background: active ? roleMeta[r].accent : 'transparent',
                    color: active ? '#0f172a' : '#94a3b8',
                    fontWeight: active ? '800' : '600',
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.25s ease',
                    boxShadow: active ? `0 0 15px ${roleMeta[r].glow}` : 'none'
                  }}
                >
                  {r}
                </button>
              );
            })}
          </div>

          <div style={{ marginBottom: '1.4rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', margin: '0 0 4px 0' }}>Welcome Back</h2>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
              Authenticate to open your {selectedRole} workspace.
            </p>
          </div>

          {msg && (
            <div style={{
              background: msg.includes('Pending') || msg.includes('Mismatch') ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: msg.includes('Pending') || msg.includes('Mismatch') ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
              color: msg.includes('Pending') || msg.includes('Mismatch') ? '#fbbf24' : '#f87171',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontSize: '0.82rem',
              lineHeight: 1.45,
              marginBottom: '1.4rem'
            }}>
              {msg}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '6px' }}>
                IDENTIFIER / EMAIL
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={selectedRole === 'admin' ? 'bhuvan123456789@gmail.com' : 'practitioner@yogalive.com'}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  padding: '0.8rem 1rem',
                  fontSize: '0.9rem',
                  color: '#fff',
                  outline: 'none',
                  transition: 'border 0.2s ease'
                }}
                onFocus={(e) => (e.target.style.border = `1px solid ${currentTheme.accent}`)}
                onBlur={(e) => (e.target.style.border = '1px solid rgba(255, 255, 255, 0.12)')}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px' }}>
                  PASSWORD SECURITY
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  padding: '0.8rem 1rem',
                  fontSize: '0.9rem',
                  color: '#fff',
                  outline: 'none',
                  transition: 'border 0.2s ease'
                }}
                onFocus={(e) => (e.target.style.border = `1px solid ${currentTheme.accent}`)}
                onBlur={(e) => (e.target.style.border = '1px solid rgba(255, 255, 255, 0.12)')}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '10px',
                border: 'none',
                background: currentTheme.accent,
                color: '#0f172a',
                fontWeight: '800',
                fontSize: '0.92rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: `0 8px 25px -4px ${currentTheme.glow}`,
                marginTop: '0.5rem',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
              onMouseEnter={(e) => (e.target.style.transform = 'translateY(-1px)')}
              onMouseLeave={(e) => (e.target.style.transform = 'translateY(0)')}
            >
              {loading ? 'Verifying Identity...' : `Enter ${selectedRole.toUpperCase()} Portal →`}
            </button>
          </form>

          <p style={{ fontSize: '0.82rem', color: '#64748b', textAlign: 'center', marginTop: '1.8rem', marginBottom: 0 }}>
            New to the ecosystem?{' '}
            <Link to="/signup" style={{ color: currentTheme.accent, fontWeight: '700', textDecoration: 'none' }}>
              Create an account or apply
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}