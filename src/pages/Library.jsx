import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function Library() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('All');
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetchSessions();
    if (user) loadFavorites();
  }, [search, level]);

  async function fetchSessions() {
    let query = supabase.from('sessions').select('*');
    if (search.trim()) query = query.ilike('title', `%${search}%`);
    if (level !== 'All') query = query.eq('level', level);
    const { data } = await query;
    if (data) setSessions(data);
  }

  async function loadFavorites() {
    const { data } = await supabase.from('favorites').select('session_id').eq('user_id', user.id);
    if (data) setFavorites(data.map((f) => f.session_id));
  }

  async function toggleFavorite(sessionId) {
    if (!user) return alert('Please login to bookmark sessions.');
    if (favorites.includes(sessionId)) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('session_id', sessionId);
      setFavorites((prev) => prev.filter((id) => id !== sessionId));
    } else {
      await supabase.from('favorites').insert([{ user_id: user.id, session_id: sessionId }]);
      setFavorites((prev) => [...prev, sessionId]);
    }
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '1rem', fontFamily: 'sans-serif' }}>
      <h2>Recorded Practice Library & Search</h2>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by title, teacher, or style..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
        />
        <select value={level} onChange={(e) => setLevel(e.target.value)} style={{ padding: '0.6rem' }}>
          <option value="All">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {sessions.map((s) => (
          <div key={s.id} style={{ border: '1px solid #cbd5e1', padding: '1.2rem', borderRadius: '8px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                {s.level}
              </span>
              <button onClick={() => toggleFavorite(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>
                {favorites.includes(s.id) ? '⭐' : '☆'}
              </button>
            </div>
            <h3 style={{ margin: '0.6rem 0 0.3rem 0' }}>{s.title}</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Instructor: <strong>{s.instructor_name}</strong></p>
            <a
              href={s.recording_url || s.stream_url}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'block', textAlign: 'center', marginTop: '0.8rem', padding: '0.5rem', background: '#0f172a', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}
            >
              Watch Recording
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}