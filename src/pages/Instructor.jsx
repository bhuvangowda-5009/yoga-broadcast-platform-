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
      setMsg('✅ Permanent studio session updated and broadcast is live!');
    } catch (err) {
      setMsg(`Error setting session: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 0%, #064e3b 0%, #090d16 60%, #030712 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#f8fafc',
      padding: '3rem 1.5rem 6rem 1.5rem'
    }}>
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>
        {/* HEADER */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '4px 12px',
            borderRadius: '16px',
            marginBottom: '0.8rem'
          }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.8px', color: '#34d399' }}>
              FACULTY BROADCAST CONSOLE
            </span>
          </div>
          <h1 style={{ fontSize: '2.3rem', fontWeight: '900', letterSpacing: '-0.8px', margin: '0 0 0.4rem 0' }}>
            Instructor Studio
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
            Manage broadcast telemetry, update current class focus, and launch your camera and microphone.
          </p>
        </div>

        {msg && (
          <div style={{
            background: msg.includes('Error') ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
            border: msg.includes('Error') ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
            color: msg.includes('Error') ? '#f87171' : '#34d399',
            padding: '0.85rem 1.2rem',
            borderRadius: '12px',
            fontSize: '0.86rem',
            fontWeight: '600',
            marginBottom: '2rem'
          }}>
            {msg}
          </div>
        )}

        {/* QUICK LAUNCH CARD */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.5) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '20px',
          padding: '2rem',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 40px -10px rgba(16, 185, 129, 0.15)',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.2rem'
        }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#34d399', letterSpacing: '0.8px' }}>
              HARDWARE BROADCAST LINK
            </span>
            <h3 style={{ margin: '0.3rem 0 0.3rem 0', fontSize: '1.25rem', fontWeight: '800' }}>
              Dedicated Studio Window
            </h3>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#94a3b8', maxWidth: '420px' }}>
              Opens your camera and microphone feed directly in a high-performance studio interface.
            </p>
          </div>
          <a
            href={streamUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.85rem 1.8rem',
              borderRadius: '10px',
              background: '#10b981',
              color: '#0f172a',
              textDecoration: 'none',
              fontWeight: '800',
              fontSize: '0.9rem',
              boxShadow: '0 8px 25px -4px rgba(16, 185, 129, 0.4)'
            }}
          >
            📹 Open Broadcaster Window →
          </a>
        </div>

        {/* SESSION CONFIGURATION FORM */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '2.4rem',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 50px -15px rgba(0, 0, 0, 0.6)'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', fontWeight: '800' }}>
            Class Configuration & Schedule Telemetry
          </h3>

          <form onSubmit={handleCreateSession} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '6px' }}>
                SESSION TITLE
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  padding: '0.8rem 1rem',
                  fontSize: '0.9rem',
                  color: '#fff',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  DIFFICULTY TIER
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    padding: '0.8rem 1rem',
                    fontSize: '0.9rem',
                    color: '#fff',
                    outline: 'none'
                  }}
                >
                  <option value="Beginner">Beginner (Foundation & Breath)</option>
                  <option value="Intermediate">Intermediate (Vinyasa Flow)</option>
                  <option value="Advanced">Advanced (Ashtanga Series)</option>
                  <option value="All Levels">All Levels (Open Practice)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  PERMANENT ROOM URL
                </label>
                <input
                  type="text"
                  required
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    padding: '0.8rem 1rem',
                    fontSize: '0.9rem',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.9rem',
                borderRadius: '10px',
                border: 'none',
                background: '#10b981',
                color: '#0f172a',
                fontWeight: '800',
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 25px -4px rgba(16, 185, 129, 0.35)',
                marginTop: '0.8rem'
              }}
            >
              {loading ? 'Publishing Updates...' : 'Publish & Sync Live Broadcast →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}