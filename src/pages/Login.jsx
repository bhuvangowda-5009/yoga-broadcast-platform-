import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [selectedRole, setSelectedRole] = useState('admin');
  const [email, setEmail] = useState('bhuvan123456789@gmail.com');
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
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      // 1. Authenticate user credentials with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // 2. Fetch user profile from public.users table
      let { data: prof } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      // Self-heal profile if missing
      if (!prof) {
        const { data: createdProf } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            name: data.user.user_metadata?.name || data.user.email.split('@')[0],
            email: data.user.email,
            phone: data.user.user_metadata?.phone || '+919876543210',
            role: selectedRole,
            verified: true
          })
          .select()
          .maybeSingle();
        prof = createdProf;
      }

      const userRole = prof?.role || 'subscriber';

      // 3. Superuser privilege: Admin can access ANY portal!
      if (userRole === 'admin') {
        await refreshUserData(data.user.id);
        if (selectedRole === 'instructor') navigate('/instructor');
        else if (selectedRole === 'coordinator') navigate('/coordinator');
        else if (selectedRole === 'subscriber') navigate('/today');
        else navigate('/admin');
        return;
      }

      // 4. Role enforcement for non-admin accounts
      if (selectedRole === 'admin' && userRole !== 'admin') {
        await supabase.auth.signOut();
        throw new Error(`Access Denied: Your account role is '${userRole}', but 'admin' access is required.`);
      }
      if (selectedRole === 'coordinator' && userRole !== 'coordinator') {
        await supabase.auth.signOut();
        throw new Error(`Access Denied: Your account role is '${userRole}', but 'coordinator' access is required.`);
      }
      if (selectedRole === 'instructor' && userRole !== 'instructor') {
        await supabase.auth.signOut();
        throw new Error(`Access Denied: Your account role is '${userRole}', but 'instructor' access is required.`);
      }

      await refreshUserData(data.user.id);

      // Route regular users to their respective dashboards
      if (userRole === 'coordinator') navigate('/coordinator');
      else if (userRole === 'instructor') navigate('/instructor');
      else navigate('/today');
    } catch (err) {
      setMsg(err.message || 'Authentication failed. Please verify password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '460px', margin: '3rem auto', padding: '2rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontFamily: 'sans-serif', background: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      {/* 4 ROLES TABS */}
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
              background: selectedRole === r ? '#0284c7' : 'transparent',
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
        Log in to access the {selectedRole} workspace.
      </p>

      {msg && (
        <p style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.6rem 0.8rem', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '1rem' }}>
          {msg}
        </p>
      )}

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>
            Email Address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {loading ? 'Authenticating...' : `Enter ${selectedRole} Portal`}
        </button>
      </form>

      <p style={{ marginTop: '1.2rem', fontSize: '0.85rem', textAlign: 'center', color: '#64748b' }}>
        Need a regular account?{' '}
        <Link to="/signup" style={{ color: '#0284c7', fontWeight: 'bold', textDecoration: 'none' }}>
          Sign up here
        </Link>
      </p>
    </div>
  );
}