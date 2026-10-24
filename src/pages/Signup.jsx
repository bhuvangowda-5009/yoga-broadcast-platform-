import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('subscriber');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, phone, role } }
      });
      if (error) throw error;

      if (data?.user) {
        await supabase.from('users').upsert({
          id: data.user.id,
          name,
          email,
          phone,
          role,
          verified: true
        });
      }

      setMsg('Account registered successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '420px', margin: '3rem auto', padding: '2rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontFamily: 'sans-serif', background: '#fff' }}>
      <h2>Create Your Account</h2>
      {msg && (
        <p style={{ 
          background: msg.includes('successfully') ? '#dcfce7' : '#fee2e2', 
          color: msg.includes('successfully') ? '#15803d' : '#b91c1c', 
          padding: '0.6rem', 
          borderRadius: '4px', 
          fontSize: '0.85rem' 
        }}>
          {msg}
        </p>
      )}

      <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        <input type="text" placeholder="Full Name" required value={name} onChange={(e) => setName(e.target.value)} style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
        <input type="email" placeholder="Email Address" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
        <input type="tel" placeholder="Phone Number" required value={phone} onChange={(e) => setPhone(e.target.value)} style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
        <input type="password" placeholder="Password (min 6 characters)" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
        
        <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Register Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
          <option value="subscriber">Subscriber</option>
          <option value="instructor">Instructor</option>
          <option value="coordinator">Coordinator</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit" disabled={loading} style={{ padding: '0.7rem', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>

      <p style={{ marginTop: '1rem', fontSize: '0.85rem', textAlign: 'center' }}>
        Already have an account? <Link to="/login" style={{ color: '#0284c7', fontWeight: 'bold' }}>Login here</Link>
      </p>
    </div>
  );
}