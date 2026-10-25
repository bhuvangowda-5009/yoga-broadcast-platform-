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
        throw new Error('User profile record not found.');
      }

      const userRole = prof.role || 'subscriber';
      const appliedRole = prof.applied_role;
      const isApproved = prof.is_approved === true;

      // 1. ADMIN CHECK
      if (selectedRole === 'admin') {
        if (userRole !== 'admin') {
          await supabase.auth.signOut();
          throw new Error('Access Denied: Only authorized administrators may log in here.');
        }
        await refreshUserData(data.user.id);
        navigate('/admin');
        return;
      }

      // 2. INSTRUCTOR / COORDINATOR CHECK
      if (selectedRole === 'instructor' || selectedRole === 'coordinator') {
        // If they are an approved admin, let them in
        if (userRole === 'admin') {
          await refreshUserData(data.user.id);
          navigate(selectedRole === 'instructor' ? '/instructor' : '/coordinator');
          return;
        }

        // Did they apply or have this role?
        const matchesRole = userRole === selectedRole || appliedRole === selectedRole;
        if (!matchesRole) {
          await supabase.auth.signOut();
          throw new Error(`Access Denied: You do not have permissions for the \${selectedRole} portal.`);
        }

        // Is it approved by admin?
        if (!isApproved || userRole !== selectedRole) {
          await supabase.auth.signOut();
          throw new Error(`⏳ Application Pending: Your request to become a \${selectedRole.toUpperCase()} has not yet been approved by the Admin.`);
        }

        await refreshUserData(data.user.id);
        navigate(selectedRole === 'instructor' ? '/instructor' : '/coordinator');
        return;
      }

      // 3. SUBSCRIBER CHECK
      await refreshUserData(data.user.id);
      navigate('/today');
    } catch (err) {
      setMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '460px', margin: '3rem auto', padding: '2rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontFamily: 'sans-serif', background: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginBottom: '1.5rem', background: '#f1f5f9', padding: '4px', borderRadius: '6px' }}>
        {['subscriber', 'instructor', 'coordinator', 'admin'].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => handleRoleTabChange(r)}
            style={{
              padding: '8px 2px',
              border: 'none',
              borderRadius: '4px',
              background: selectedRole === r ? (r === 'admin' ? '#ef4444' : '#0284c7') : 'transparent',
              color: selectedRole === r ? '#fff' : '#475569',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.78rem',
              textTransform: 'capitalize'
            }}
          >
            {r}
          </button>
        ))}
      </div>

      <h2 style={{ textAlign: 'center', margin: '0 0 0.5rem 0', textTransform: 'capitalize' }}>
        {selectedRole} Portal
      </h2>
      <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
        {selectedRole === 'subscriber' && 'Open to all registered subscribers.'}
        {selectedRole === 'instructor' && 'Authorized instructors only (requires Admin approval).'}
        {selectedRole === 'coordinator' && 'Schedule coordinators only (requires Admin approval).'}
        {selectedRole === 'admin' && 'Restricted to Chief Platform Administrator.'}
      </p>

      {msg && (
        <p style={{
          background: msg.includes('Pending') ? '#fef3c7' : '#fee2e2',
          color: msg.includes('Pending') ? '#92400e' : '#b91c1c',
          padding: '0.75rem',
          borderRadius: '4px',
          fontSize: '0.85rem',
          lineHeight: '1.4',
          marginBottom: '1rem'
        }}>
          {msg}
        </p>
      )}

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={selectedRole === 'admin' ? 'bhuvan123456789@gmail.com' : 'you@example.com'}
            style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem',
            background: selectedRole === 'admin' ? '#ef4444' : selectedRole === 'coordinator' ? '#a855f7' : selectedRole === 'instructor' ? '#10b981' : '#0284c7',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            marginTop: '0.5rem',
            fontSize: '0.9rem'
          }}
        >
          {loading ? 'Verifying...' : `Login as \${selectedRole}`}
        </button>
      </form>

      <p style={{ marginTop: '1.2rem', fontSize: '0.85rem', textAlign: 'center', color: '#64748b' }}>
        Need an account? <Link to="/signup" style={{ color: '#0284c7', fontWeight: 'bold', textDecoration: 'none' }}>Sign up / Apply</Link>
      </p>
    </div>
  );
}