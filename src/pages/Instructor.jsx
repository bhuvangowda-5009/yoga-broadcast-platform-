import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function Instructor() {
  const { user, profile } = useAuth();
  const [title, setTitle] = useState('Daily Live Yoga & Pranayama Studio');
  const [level, setLevel] = useState('All Levels');
  const [streamUrl, setStreamUrl] = useState('https://meet.jit.si/YogaLive_Permanent_MainStudio');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreateSession(e) {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const { error } = await supabase.from('sessions').upsert([
        {
          id: '00000000-0000-0000-0000-000000000001',
          title,
          instructor_id: user?.id,
          instructor_name: profile?.name || 'Yogi Instructor',
          level,
          stream_url: streamUrl,
          is_live: true,
          status: 'approved'
        }
      ]);

      if (error) throw error;

      setMsg('Permanent broadcast session updated and marked live!');
    } catch (err) {
      setMsg(`Error setting session: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '680px', margin: '2.5rem auto', padding: '2rem', fontFamily: 'sans-serif', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
      <h2 style={{ color: '#0f172a', margin: '0 0 0.5rem 0' }}>🧘 Instructor Broadcast Studio</h2>
      <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
        Manage the permanent broadcast room and launch your camera/microphone feed.
      </p>

      {msg && (
        <p style={{
          background: msg.includes('Error') ? '#fee2e2' : '#dcfce7',
          color: msg.includes('Error') ? '#b91c1c' : '#15803d',
          padding: '0.7rem',
          borderRadius: '4px',
          fontSize: '0.85rem'
        }}>
          {msg}
        </p>
      )}

      {/* QUICK LAUNCH BROADCAST WINDOW */}
      <div style={{ background: '#f8fafc', border: '1px dashed #0284c7', padding: '1rem', borderRadius: '6px', margin: '1rem 0' }}>
        <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: '#0369a1', fontSize: '0.9rem' }}>
          📹 Live Camera & Mic Broadcaster
        </p>
        <p style={{ margin: '0 0 0.8rem 0', color: '#64748b', fontSize: '0.82rem' }}>
          Click below to open the dedicated instructor broadcasting room in a new window.
        </p>
        <a
          href={streamUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '0.65rem 1.2rem',
            background: '#0284c7',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '0.85rem',
            fontWeight: 'bold'
          }}
        >
          🚀 Open Broadcaster Window
        </a>
      </div>

      <form onSubmit={handleCreateSession} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>Session Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>Difficulty Level</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="All Levels">All Levels</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>Permanent Broadcast URL</label>
          <input
            type="text"
            required
            value={streamUrl}
            onChange={(e) => setStreamUrl(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem',
            background: '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '0.95rem'
          }}
        >
          {loading ? 'Updating...' : 'Save & Publish Live Studio'}
        </button>
      </form>
    </div>
  );
}