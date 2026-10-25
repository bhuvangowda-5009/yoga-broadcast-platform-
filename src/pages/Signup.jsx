import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [desiredRole, setDesiredRole] = useState('subscriber');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      if (desiredRole === 'admin') {
        throw new Error('Admin registration is strictly prohibited.');
      }

      const isStaffApplication = desiredRole === 'instructor' || desiredRole === 'coordinator';
      // If staff, their base role stays 'subscriber' until admin approves their applied_role
      const actualRole = isStaffApplication ? 'subscriber' : 'subscriber';
      const isApproved = !isStaffApplication;

      // 1. Sign up auth account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            role: actualRole,
            applied_role: isStaffApplication ? desiredRole : null,
            is_approved: isApproved
          }
        }
      });

      if (error) throw error;

      // 2. Persist in public.users table
      if (data.user) {
        await supabase.from('users').upsert({
          id: data.user.id,
          name,
          email,
          phone,
          role: actualRole,
          applied_role: isStaffApplication ? desiredRole : null,
          is_approved: isApproved,
          verified: true
        });
      }

      // 3. For staff applications: log out immediately and show pending notice
      if (isStaffApplication) {
        await supabase.auth.signOut();
        setMsg(`📋 Application Received! Your application for "${desiredRole.toUpperCase()}" has been sent to the Admin. You cannot access the ${desiredRole} portal until approved.`);
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
        return;
      }

      setMsg('🎉 Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setMsg(`Signup error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '440px', margin: '3rem auto', padding: '2rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontFamily: 'sans-serif', background: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', margin: '0 0 0.5rem 0' }}>Join YogaLive</h2>
      <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Create an account or apply for instructor/coordinator credentials.
      </p>

      {msg && (
        <p style={{
          background: msg.includes('Application Received') ? '#fef3c7' : msg.includes('successful') ? '#dcfce7' : '#fee2e2',
          color: msg.includes('Application Received') ? '#92400e' : msg.includes('successful') ? '#15803d' : '#b91c1c',
          padding: '0.75rem',
          borderRadius: '4px',
          fontSize: '0.85rem',
          lineHeight: '1.4'
        }}>
          {msg}
        </p>
      )}

      <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>Phone Number</label>
          <input
            type="tel"
            required
            placeholder="+919876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px', color: '#334155' }}>Account Type</label>
          <select
            value={desiredRole}
            onChange={(e) => setDesiredRole(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#fff' }}
          >
            <option value="subscriber">Subscriber (Instant Access)</option>
            <option value="instructor">Instructor (Requires Admin Approval)</option>
            <option value="coordinator">Coordinator (Requires Admin Approval)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem',
            background: '#0284c7',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            marginTop: '0.5rem',
            fontSize: '0.9rem'
          }}
        >
          {loading ? 'Processing...' : desiredRole === 'subscriber' ? 'Create Account' : 'Submit Application'}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: '0.85rem', marginTop: '1.2rem', color: '#64748b' }}>
        Already registered? <Link to="/login" style={{ color: '#0284c7', fontWeight: 'bold', textDecoration: 'none' }}>Log in</Link>
      </p>
    </div>
  );
}