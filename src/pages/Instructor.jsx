import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const DEFAULT_WEBRTC_ROOM = 'https://meet.jit.si/YogaLive_Permanent_MainStudio';

const PRESET_RECORDINGS = [
  {
    title: 'Surya Namaskar A & B (Classic Sun Salutations)',
    level: 'Beginner',
    duration: '35 mins',
    url: 'https://www.youtube.com/embed/v7AYKMP6rOE',
    thumb: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=700&q=80'
  },
  {
    title: 'Dynamic Vinyasa Flow: Core Strength & Spinal Mobility',
    level: 'Intermediate',
    duration: '45 mins',
    url: 'https://www.youtube.com/embed/sTANio_2E0Q',
    thumb: 'https://images.unsplash.com/photo-1552196563-55235889758e?auto=format&fit=crop&w=700&q=80'
  },
  {
    title: 'Ashtanga Primary Series & Bandha Alignment',
    level: 'Advanced',
    duration: '60 mins',
    url: 'https://www.youtube.com/embed/inpok4MKVLM',
    thumb: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=700&q=80'
  },
  {
    title: 'Deep Pranayama & Kundalini Breath Control',
    level: 'All Levels',
    duration: '30 mins',
    url: 'https://www.youtube.com/embed/b1H3xO3x_Js',
    thumb: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=700&q=80'
  },
  {
    title: 'Gentle Evening Restorative & Yoga Nidra',
    level: 'Beginner',
    duration: '40 mins',
    url: 'https://www.youtube.com/embed/4pLUleLdwY4',
    thumb: 'https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?auto=format&fit=crop&w=700&q=80'
  }
];

export default function Instructor() {
  const { user, profile } = useAuth();
  const [title, setTitle] = useState('Daily Surya & Pranayama Studio');
  const [level, setLevel] = useState('Intermediate');
  const [duration, setDuration] = useState('45 mins');
  const [webrtcRoom, setWebrtcRoom] = useState(DEFAULT_WEBRTC_ROOM);
  const [replayUrl, setReplayUrl] = useState('https://www.youtube.com/embed/sTANio_2E0Q');
  const [thumbnailUrl, setThumbnailUrl] = useState('https://images.unsplash.com/photo-1552196563-55235889758e?auto=format&fit=crop&w=700&q=80');

  const [isCurrentlyLive, setIsCurrentlyLive] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [archivedLibrary, setArchivedLibrary] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSessionState();
    loadLibraryList();
  }, []);

  async function loadSessionState() {
    try {
      const { data } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setCurrentSessionId(data.id);
        setTitle(data.title || title);
        setLevel(data.level || level);
        setIsCurrentlyLive(data.is_live === true);
        if (data.recording_url) setReplayUrl(data.recording_url);
      }
    } catch (err) {
      console.warn('Could not load session state:', err);
    }
  }

  async function loadLibraryList() {
    try {
      const { data } = await supabase
        .from('sessions')
        .select('*')
        .eq('is_recorded', true)
        .order('created_at', { ascending: false });

      if (data) setArchivedLibrary(data);
    } catch (err) {
      console.warn('Could not load library:', err);
    }
  }

  function handleSelectPreset(preset) {
    setTitle(preset.title);
    setLevel(preset.level);
    setDuration(preset.duration);
    setReplayUrl(preset.url);
    setThumbnailUrl(preset.thumb);
    setMsg(`Template applied: "${preset.title}"`);
  }

  // 1. GO LIVE: Switch Today's Practice to WebRTC Camera Stream
  async function handleGoLive(e) {
    if (e) e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const payload = {
        title: title.trim(),
        instructor_id: user?.id || null,
        instructor_name: profile?.name || 'Lead Master',
        level,
        stream_url: webrtcRoom || DEFAULT_WEBRTC_ROOM,
        recording_url: replayUrl,
        duration,
        thumbnail: thumbnailUrl,
        is_live: true,
        is_recorded: false,
        status: 'approved'
      };

      if (currentSessionId) {
        await supabase.from('sessions').update(payload).eq('id', currentSessionId);
      } else {
        const { data } = await supabase.from('sessions').insert([payload]).select().maybeSingle();
        if (data) setCurrentSessionId(data.id);
      }

      setIsCurrentlyLive(true);
      setMsg('🔴 LIVE BROADCAST ACTIVE! Your camera feed is now transmitting to all students on Today\'s Practice.');
    } catch (err) {
      setMsg(`Failed to start live stream: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // 2. END SESSION & ARCHIVE: Saves full day replay on Today's Practice AND publishes to Library
  async function handleEndSessionAndArchive() {
    if (!window.confirm('End live broadcast? This will transition Today\'s Practice to replay mode and publish this class into the Library.')) {
      return;
    }

    setLoading(true);
    setMsg('');

    try {
      const finalTitle = title.trim();
      const finalReplayUrl = replayUrl.trim() || 'https://www.youtube.com/embed/sTANio_2E0Q';

      // 1. Update Today's Practice row to stream the replay for the remainder of the day
      if (currentSessionId) {
        await supabase
          .from('sessions')
          .update({
            title: `${finalTitle} (Today's Replay)`,
            stream_url: finalReplayUrl,
            recording_url: finalReplayUrl,
            is_live: false,
            is_recorded: true,
            thumbnail: thumbnailUrl,
            duration
          })
          .eq('id', currentSessionId);
      }

      // 2. Ensure a permanent entry exists in the Library without duplication
      const { data: existingLib } = await supabase
        .from('sessions')
        .select('id')
        .eq('title', finalTitle)
        .eq('is_recorded', true)
        .maybeSingle();

      if (!existingLib) {
        await supabase.from('sessions').insert([
          {
            title: finalTitle,
            instructor_id: user?.id || null,
            instructor_name: profile?.name || 'Lead Master',
            level,
            stream_url: finalReplayUrl,
            recording_url: finalReplayUrl,
            duration,
            thumbnail: thumbnailUrl,
            is_live: false,
            is_recorded: true,
            status: 'approved'
          }
        ]);
      }

      setIsCurrentlyLive(false);
      setMsg(`🎉 Class concluded! "${finalTitle}" is now active as Today's Replay AND saved to the On-Demand Library.`);
      await loadLibraryList();
    } catch (err) {
      setMsg(`Failed to conclude session: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // 3. Delete an item from the library ledger
  async function handleDeleteLibraryItem(id, itemTitle) {
    if (!window.confirm(`Delete "${itemTitle}" from library?`)) return;
    try {
      await supabase.from('sessions').delete().eq('id', id);
      setMsg(`Removed "${itemTitle}" from library.`);
      await loadLibraryList();
    } catch (err) {
      setMsg(`Delete failed: ${err.message}`);
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
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
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
              FACULTY LIVE BROADCAST & REPLAY CONSOLE
            </span>
          </div>
          <h1 style={{ fontSize: '2.3rem', fontWeight: '900', letterSpacing: '-0.8px', margin: '0 0 0.4rem 0' }}>
            Instructor Studio
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
            Launch your camera stream, broadcast live to students, and automatically archive the replay to Today's Practice and the Library.
          </p>
        </div>

        {msg && (
          <div style={{
            background: msg.includes('Failed') ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
            border: msg.includes('Failed') ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
            color: msg.includes('Failed') ? '#f87171' : '#34d399',
            padding: '0.85rem 1.2rem',
            borderRadius: '12px',
            fontSize: '0.86rem',
            fontWeight: '600',
            marginBottom: '2rem'
          }}>
            {msg}
          </div>
        )}

        {/* STATUS & BROADCASTER WINDOW LAUNCHER */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.6) 100%)',
          border: isCurrentlyLive ? '1px solid #ef4444' : '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: '20px',
          padding: '2rem',
          backdropFilter: 'blur(20px)',
          boxShadow: isCurrentlyLive ? '0 0 35px -5px rgba(239, 68, 68, 0.3)' : '0 20px 40px -10px rgba(16, 185, 129, 0.2)',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.2rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: isCurrentlyLive ? '#ef4444' : '#22c55e',
                boxShadow: isCurrentlyLive ? '0 0 10px #ef4444' : '0 0 10px #22c55e'
              }}></span>
              <span style={{ fontSize: '0.74rem', fontWeight: '900', color: isCurrentlyLive ? '#f87171' : '#34d399', letterSpacing: '0.8px' }}>
                {isCurrentlyLive ? 'STUDIO TRANSMITTING LIVE NOW' : 'STUDIO READY (STANDBY)'}
              </span>
            </div>
            <h3 style={{ margin: '0.3rem 0 0.3rem 0', fontSize: '1.35rem', fontWeight: '800' }}>
              Instructor Camera & Microphone Link
            </h3>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#cbd5e1', maxWidth: '440px' }}>
              Step 1: Open your camera room in a new tab. Step 2: Click "Start Live Stream".
            </p>
          </div>

          <a
            href={webrtcRoom}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.95rem 2rem',
              borderRadius: '12px',
              background: '#10b981',
              color: '#0f172a',
              textDecoration: 'none',
              fontWeight: '900',
              fontSize: '0.95rem',
              boxShadow: '0 8px 25px -4px rgba(16, 185, 129, 0.45)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            📹 1. Open Camera Studio Window →
          </a>
        </div>

        {/* QUICK PRACTICE PRESETS */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '20px',
          padding: '1.6rem 2rem',
          backdropFilter: 'blur(20px)',
          marginBottom: '2rem'
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#38bdf8', letterSpacing: '0.8px' }}>
            QUICK PRESET PRACTICE TEMPLATES
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '0.8rem' }}>
            {PRESET_RECORDINGS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                style={{
                  background: title === preset.title ? '#0284c7' : 'rgba(255, 255, 255, 0.06)',
                  color: title === preset.title ? '#fff' : '#cbd5e1',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {preset.title.split('(')[0]} ({preset.level})
              </button>
            ))}
          </div>
        </div>

        {/* BROADCAST CONTROL FORM */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '2.4rem',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 50px -15px rgba(0, 0, 0, 0.6)',
          marginBottom: '2.5rem'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', fontWeight: '800' }}>
            Session Details & Dual Action Controls
          </h3>

          <form onSubmit={handleGoLive} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '6px' }}>
                YOGA SESSION TITLE
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
                  PRACTICE LEVEL
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
                  CLASS DURATION
                </label>
                <input
                  type="text"
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#34d399', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  LIVE WEBRTC ROOM (CAMERA & MIC)
                </label>
                <input
                  type="text"
                  required
                  value={webrtcRoom}
                  onChange={(e) => setWebrtcRoom(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '10px',
                    padding: '0.8rem 1rem',
                    fontSize: '0.85rem',
                    color: '#34d399',
                    fontWeight: '700',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#38bdf8', letterSpacing: '0.5px', marginBottom: '6px' }}>
                  DAILY REPLAY & LIBRARY RECORDING URL
                </label>
                <input
                  type="text"
                  required
                  value={replayUrl}
                  onChange={(e) => setReplayUrl(e.target.value)}
                  placeholder="https://www.youtube.com/embed/..."
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    borderRadius: '10px',
                    padding: '0.8rem 1rem',
                    fontSize: '0.85rem',
                    color: '#38bdf8',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* DUAL ACTION BUTTONS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '1.2rem' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#0284c7',
                  color: '#fff',
                  fontWeight: '900',
                  fontSize: '0.95rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 25px -4px rgba(2, 132, 199, 0.4)'
                }}
              >
                {loading ? 'Starting...' : '🔴 2. Start Live Stream (Send Camera to Today\'s Practice)'}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleEndSessionAndArchive}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#10b981',
                  color: '#0f172a',
                  fontWeight: '900',
                  fontSize: '0.95rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 25px -4px rgba(16, 185, 129, 0.4)'
                }}
              >
                {loading ? 'Saving...' : '💾 3. End Session & Save to Today\'s Replay + Library'}
              </button>
            </div>
          </form>
        </div>

        {/* LIBRARY LEDGER */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          overflow: 'hidden',
          backdropFilter: 'blur(20px)'
        }}>
          <div style={{ padding: '1.4rem 1.8rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800' }}>Active Library Ledger</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                All recordings currently accessible in the On-Demand Library.
              </p>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '4px 10px', borderRadius: '6px' }}>
              {archivedLibrary.length} CLASSES SAVED
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0, 0, 0, 0.3)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <th style={{ padding: '12px 18px', fontSize: '0.74rem', color: '#94a3b8' }}>CLASS TITLE</th>
                <th style={{ padding: '12px 18px', fontSize: '0.74rem', color: '#94a3b8' }}>TIER</th>
                <th style={{ padding: '12px 18px', fontSize: '0.74rem', color: '#94a3b8' }}>DATE</th>
                <th style={{ padding: '12px 18px', fontSize: '0.74rem', color: '#94a3b8' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {archivedLibrary.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                    No sessions archived yet. End a session above to archive it into the library.
                  </td>
                </tr>
              ) : (
                archivedLibrary.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '14px 18px', fontWeight: '700', fontSize: '0.88rem' }}>
                      {item.title}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', fontWeight: '800' }}>
                        {item.level || 'All Levels'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#94a3b8', fontSize: '0.82rem' }}>
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Today'}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <button
                        onClick={() => handleDeleteLibraryItem(item.id, item.title)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#f87171',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        ✕ Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}