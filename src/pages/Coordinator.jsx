import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Coordinator({ profile }) {
  const [sessions, setSessions] = useState([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Hatha');
  const [instructor, setInstructor] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadCoordinatorSessions();
  }, []);

  async function loadCoordinatorSessions() {
    const { data } = await supabase.from('yoga_sessions').select('*').order('created_at', { ascending: false });
    if (data) setSessions(data);
  }

  async function handleAddSession(e) {
    e.preventDefault();
    setMsg('');
    const { error } = await supabase.from('yoga_sessions').insert([{
      title,
      category,
      instructor_name: instructor || 'Yoga Master',
      is_live: true
    }]);

    if (error) {
      setMsg(`Error: ${error.message}`);
    } else {
      setMsg('✅ Session scheduled and added to broadcast list!');
      setTitle('');
      setInstructor('');
      loadCoordinatorSessions();
    }
  }

  async function handleDelete(id) {
    await supabase.from('yoga_sessions').delete().eq('id', id);
    loadCoordinatorSessions();
  }

  if (profile?.role !== 'coordinator' && profile?.role !== 'admin') {
    return <div style={{ padding: '3rem', textAlign: 'center' }}><h3>Access Denied. Coordinator/Admin permissions required.</h3></div>;
  }

  return (
    <div style={{ maxWidth: '850px', margin: '2rem auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>📋 Coordinator Schedule Portal</h2>
      {msg && <p style={{ color: msg.includes('Error') ? 'red' : 'green', fontWeight: 'bold' }}>{msg}</p>}

      <form onSubmit={handleAddSession} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '2rem' }}>
        <h3>Schedule New Yoga Practice Slot</h3>
        <input type="text" placeholder="Class Title (e.g., Evening Stress Relief)" required value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: '0.6rem' }} />
        <input type="text" placeholder="Instructor Name" required value={instructor} onChange={(e) => setInstructor(e.target.value)} style={{ padding: '0.6rem' }} />
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: '0.6rem' }}>
          <option value="Hatha">Hatha</option>
          <option value="Vinyasa">Vinyasa</option>
          <option value="Ashtanga">Ashtanga</option>
          <option value="Pranayama">Pranayama</option>
          <option value="Yin">Yin</option>
        </select>
        <button type="submit" style={{ padding: '0.7rem', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Publish Daily Session
        </button>
      </form>

      <h3>Managed Practice Sessions</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#e2e8f0', textAlign: 'left' }}>
            <th style={{ padding: '8px' }}>Title</th>
            <th style={{ padding: '8px' }}>Category</th>
            <th style={{ padding: '8px' }}>Instructor</th>
            <th style={{ padding: '8px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s, index) => (
            <tr key={`${s.id}-${index}`} style={{ borderBottom: '1px solid #cbd5e1' }}>
              <td style={{ padding: '8px' }}>{s.title}</td>
              <td style={{ padding: '8px' }}>{s.category}</td>
              <td style={{ padding: '8px' }}>{s.instructor_name}</td>
              <td style={{ padding: '8px' }}>
                <button onClick={() => handleDelete(s.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}