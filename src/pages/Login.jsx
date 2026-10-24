import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Login({ user }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('subscriber');
  const [phone, setPhone] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (user) return <Navigate to="/explore" replace />;

  async function handleAuth(e) {
    e.preventDefault();
    setMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, role, phone } }
        });
        if (error) throw error;

        if (data?.user) {
          await supabase.from('yoga_profiles').upsert({
            id: data.user.id,
            full_name: fullName,
            email: email,
            phone: phone,
            role: role
          });
        }
        setMsg('Account created successfully!');
        navigate('/explore');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/explore');
      }
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '420px', margin: '3rem auto', padding: '2rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontFamily: 'sans-serif' }}>
      <h2>{isRegister ? 'Register for Yoga Platform' : 'Sign In'}</h2>
      {msg && <p style={{ color: msg.includes('success') ? 'green' : 'red', fontSize: '0.85rem' }}>{msg}</p>}

      <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {isRegister && (
          <>
            <input type="text" placeholder="Full Name" required value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ padding: '0.6rem' }} />
            <input type="tel" placeholder="Phone Number (SMS/WhatsApp)" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ padding: '0.6rem' }} />
            <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: '0.6rem' }}>
              <option value="subscriber">Subscriber</option>
              <option value="instructor">Yoga Instructor</option>
              <option value="coordinator">Coordinator</option>
              <option value="admin">Admin</option>
            </select>
          </>
        )}

        <input type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '0.6rem' }} />
        <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '0.6rem' }} />

        <button type="submit" disabled={loading} style={{ padding: '0.7rem', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          {loading ? 'Please wait...' : (isRegister ? 'Sign Up' : 'Log In')}
        </button>
      </form>

      <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#0284c7', cursor: 'pointer' }} onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? 'Already have an account? Sign in' : 'Need an account? Register here'}
      </p>
    </div>
  );
}