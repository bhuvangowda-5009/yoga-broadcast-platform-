import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';

function Navigation() {
  return (
    <nav style={{ padding: '1rem', background: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h2 style={{ margin: 0, fontSize: '1.25rem' }}>🧘 YogaLive Broadcast</h2>
      <div style={{ display: 'flex', gap: '1.2rem' }}>
        <Link to="/" style={{ color: '#f8fafc', textDecoration: 'none' }}>Home</Link>
        <Link to="/explore" style={{ color: '#f8fafc', textDecoration: 'none' }}>Search & Practice</Link>
        <Link to="/login" style={{ color: '#f8fafc', textDecoration: 'none' }}>Login / Sign Up</Link>
        <Link to="/coordinator" style={{ color: '#38bdf8', textDecoration: 'none' }}>Coordinator</Link>
        <Link to="/admin" style={{ color: '#f87171', textDecoration: 'none' }}>Admin</Link>
      </div>
    </nav>
  );
}

function Home() {
  return (
    <div style={{ padding: '4rem 2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>Daily Yoga Broadcast Platform</h1>
      <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
        Live interactive yoga practice sessions, subscriber progress tracking, and daily schedules.
      </p>
      <Link to="/explore" style={{ padding: '0.8rem 1.6rem', background: '#0284c7', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>
        Explore Live Classes →
      </Link>
    </div>
  );
}

function Explore() {
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, [search, category]);

  async function fetchSessions() {
    let query = supabase.from('yoga_sessions').select('*');
    if (search.trim()) query = query.ilike('title', `%${search}%`);
    if (category !== 'All') query = query.eq('category', category);

    const { data, error } = await query;
    if (!error && data) setSessions(data);
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>🔍 Search & Discover Yoga Sessions</h2>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by title (e.g. Vinyasa, Morning Flow)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '250px', padding: '0.6rem 0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: '0.6rem 1rem', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="All">All Categories</option>
          <option value="Hatha">Hatha</option>
          <option value="Vinyasa">Vinyasa</option>
          <option value="Ashtanga">Ashtanga</option>
          <option value="Pranayama">Pranayama</option>
          <option value="Yin">Yin</option>
        </select>
      </div>

      {activeSession && (
        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#0f172a', color: '#fff', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>🔴 Broadcasting: {activeSession.title}</h3>
            <button onClick={() => setActiveSession(null)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Close Stream</button>
          </div>
          <div style={{ background: '#000', height: '320px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '1rem 0' }}>
            <p style={{ color: '#94a3b8' }}>Live Broadcast Video Stream Active (Instructor Feed)</p>
          </div>
          <p><strong>Instructor:</strong> {activeSession.instructor_name} | <strong>Level:</strong> {activeSession.level}</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {sessions.map((s) => (
          <div key={s.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', background: '#fff' }}>
            <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', background: s.is_live ? '#fee2e2' : '#e0f2fe', color: s.is_live ? '#b91c1c' : '#0369a1', fontWeight: 'bold' }}>
              {s.is_live ? '● LIVE NOW' : 'UPCOMING'}
            </span>
            <h3 style={{ margin: '0.5rem 0' }}>{s.title}</h3>
            <p style={{ fontSize: '0.9rem', color: '#475569' }}>{s.description}</p>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Instructor: <strong>{s.instructor_name}</strong> | {s.category}</p>
            <button
              onClick={() => setActiveSession(s)}
              style={{ marginTop: '0.5rem', width: '100%', padding: '0.6rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Join Session
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('subscriber');
  const [isRegister, setIsRegister] = useState(false);
  const [msg, setMsg] = useState('');

  async function handleAuth(e) {
    e.preventDefault();
    setMsg('');
    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, role } }
        });
        if (error) throw error;
        setMsg('Signup successful! Check email or sign in directly.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMsg('Logged in successfully!');
      }
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '3rem auto', padding: '2rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontFamily: 'sans-serif' }}>
      <h2>{isRegister ? 'Sign Up' : 'Log In'}</h2>
      {msg && <p style={{ color: msg.includes('success') ? 'green' : 'red', fontSize: '0.9rem' }}>{msg}</p>}
      <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {isRegister && (
          <>
            <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required style={{ padding: '0.6rem' }} />
            <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: '0.6rem' }}>
              <option value="subscriber">Subscriber</option>
              <option value="instructor">Yoga Instructor</option>
            </select>
          </>
        )}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '0.6rem' }} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '0.6rem' }} />
        <button type="submit" style={{ padding: '0.7rem', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {isRegister ? 'Register' : 'Login'}
        </button>
      </form>
      <p style={{ marginTop: '1rem', fontSize: '0.9rem', cursor: 'pointer', color: '#0284c7' }} onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? 'Already registered? Login here.' : 'Need an account? Sign up.'}
      </p>
    </div>
  );
}

function Coordinator() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h2>📋 Coordinator Schedule Portal</h2>
      <p>Assign instructor slots, manage morning/evening batches, and review class bookings.</p>
    </div>
  );
}

function Admin() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🛡️ Admin Management Dashboard</h2>
      <p>System metrics, instructor verification requests, and subscription revenue oversight.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/login" element={<Login />} />
        <Route path="/coordinator" element={<Coordinator />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}