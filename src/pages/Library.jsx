import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const DEFAULT_RECORDINGS = [
  {
    id: 'rec-1',
    title: 'Surya Namaskar A & B (Classic Sun Salutations)',
    instructor_name: 'Acharya Dev',
    level: 'Beginner',
    duration: '30 mins',
    date: 'Oct 25, 2026',
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=700&q=80',
    embed_url: 'https://www.youtube.com/embed/v7AYKMP6rOE'
  },
  {
    id: 'rec-2',
    title: 'Ashtanga Primary Series & Bandha Flow',
    instructor_name: 'Mira Devi',
    level: 'Advanced',
    duration: '60 mins',
    date: 'Oct 24, 2026',
    thumbnail: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=700&q=80',
    embed_url: 'https://www.youtube.com/embed/inpok4MKVLM'
  },
  {
    id: 'rec-3',
    title: 'Pranayama & Kundalini Breath Control',
    instructor_name: 'Arjun Varma',
    level: 'All Levels',
    duration: '35 mins',
    date: 'Oct 23, 2026',
    thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=700&q=80',
    embed_url: 'https://www.youtube.com/embed/b1H3xO3x_Js'
  },
  {
    id: 'rec-4',
    title: 'Gentle Evening Restorative & Yoga Nidra',
    instructor_name: 'Elena Rostova',
    level: 'Beginner',
    duration: '40 mins',
    date: 'Oct 22, 2026',
    thumbnail: 'https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?auto=format&fit=crop&w=700&q=80',
    embed_url: 'https://www.youtube.com/embed/4pLUleLdwY4'
  },
  {
    id: 'rec-5',
    title: 'Dynamic Vinyasa Flow: Core & Hip Opening',
    instructor_name: 'Acharya Dev',
    level: 'Intermediate',
    duration: '50 mins',
    date: 'Oct 21, 2026',
    thumbnail: 'https://images.unsplash.com/photo-1552196563-55235889758e?auto=format&fit=crop&w=700&q=80',
    embed_url: 'https://www.youtube.com/embed/sTANio_2E0Q'
  }
];

export default function Library() {
  const { profile, subscription } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedVideo, setSelectedVideo] = useState(null);

  const role = profile?.role || 'subscriber';
  const isStaff = role === 'admin' || role === 'instructor' || role === 'coordinator';
  // Strictly requires paid subscription (or staff role) - Demo users cannot access library
  const hasAccess = !!subscription || isStaff;

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    try {
      // Pull all sessions marked as recorded
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('is_recorded', true)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Map database records into display objects
        const dbItems = data.map((s, idx) => ({
          id: s.id,
          title: s.title || 'Recorded Yoga Masterclass',
          instructor_name: s.instructor_name || 'YogaLive Master',
          level: s.level || 'All Levels',
          duration: s.duration || '45 mins',
          date: s.created_at ? new Date(s.created_at).toLocaleDateString() : 'Archived',
          thumbnail: s.thumbnail || DEFAULT_RECORDINGS[idx % DEFAULT_RECORDINGS.length].thumbnail,
          embed_url: s.recording_url || s.stream_url || DEFAULT_RECORDINGS[idx % DEFAULT_RECORDINGS.length].embed_url
        }));

        // Deduplicate in memory by title to guarantee clean catalog
        const uniqueTitles = new Set();
        const deduplicated = [];
        for (const item of dbItems) {
          if (!uniqueTitles.has(item.title.toLowerCase())) {
            uniqueTitles.add(item.title.toLowerCase());
            deduplicated.push(item);
          }
        }

        setSessions(deduplicated);
      } else {
        setSessions(DEFAULT_RECORDINGS);
      }
    } catch (err) {
      console.warn('Library loading fallback:', err);
      setSessions(DEFAULT_RECORDINGS);
    }
  }

  const filteredSessions = activeFilter === 'All'
    ? sessions
    : sessions.filter((s) => s.level.toLowerCase() === activeFilter.toLowerCase());

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 0%, #172554 0%, #090d16 60%, #030712 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#f8fafc',
      padding: '3rem 1.5rem 6rem 1.5rem'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              padding: '4px 12px',
              borderRadius: '16px',
              marginBottom: '0.8rem'
            }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.8px', color: '#38bdf8' }}>
                RECORDED MASTERCLASSES & REPLAYS
              </span>
            </div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: '900', letterSpacing: '-0.8px', margin: '0 0 0.4rem 0' }}>
              On-Demand Practice Library
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
              Archived library accessible exclusively to verified paid subscribers.
            </p>
          </div>

          {/* FILTER PILLS */}
          <div style={{
            display: 'flex',
            gap: '6px',
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            {['All', 'Beginner', 'Intermediate', 'Advanced'].map((lvl) => {
              const active = activeFilter === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setActiveFilter(lvl)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: active ? '#0284c7' : 'transparent',
                    color: active ? '#fff' : '#94a3b8',
                    fontWeight: active ? '800' : '600',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
        </div>

        {/* LOCKED VAULT PROMPT IF NOT PAID */}
        {!hasAccess ? (
          <div style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '24px',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
            padding: '4.5rem 2rem',
            textAlign: 'center',
            maxWidth: '640px',
            margin: '3rem auto'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              marginBottom: '1.2rem'
            }}>
              🔒
            </div>
            <h2 style={{ fontSize: '1.7rem', fontWeight: '800', margin: '0 0 0.6rem 0' }}>
              Vault Reserved For Paid Subscribers
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '480px', margin: '0 auto 2rem auto' }}>
              The 1-Day Free Demo includes live daily broadcasts, but recorded session archives require an active paid subscription pass.
            </p>
            <Link
              to="/pricing"
              style={{
                display: 'inline-block',
                padding: '0.9rem 2.2rem',
                borderRadius: '12px',
                background: '#10b981',
                color: '#0f172a',
                textDecoration: 'none',
                fontWeight: '800',
                fontSize: '0.95rem',
                boxShadow: '0 8px 25px -4px rgba(16, 185, 129, 0.4)'
              }}
            >
              Unlock On-Demand Library Pass →
            </Link>
          </div>
        ) : (
          /* VIDEO GRID */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '24px'
          }}>
            {filteredSessions.map((rec) => (
              <div
                key={rec.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.6)',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, border-color 0.2s ease'
                }}
                onClick={() => setSelectedVideo(rec)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                }}
              >
                <div style={{ position: 'relative', width: '100%', height: '170px', background: '#000', overflow: 'hidden' }}>
                  <img
                    src={rec.thumbnail}
                    alt={rec.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(0, 0, 0, 0.65)',
                    color: '#38bdf8',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    border: '1px solid rgba(56, 189, 248, 0.3)'
                  }}>
                    {rec.level}
                  </span>
                  <span style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    background: 'rgba(0, 0, 0, 0.75)',
                    color: '#f8fafc',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: '700'
                  }}>
                    {rec.duration}
                  </span>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'rgba(2, 132, 199, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    boxShadow: '0 0 20px rgba(2, 132, 199, 0.6)'
                  }}>
                    ▶
                  </div>
                </div>

                <div style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: '800', color: '#f8fafc', lineHeight: 1.4 }}>
                      {rec.title}
                    </h3>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                      Instructor: <strong style={{ color: '#cbd5e1' }}>{rec.instructor_name}</strong>
                    </p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.8rem', fontSize: '0.76rem', color: '#64748b' }}>
                    <span>Recorded: {rec.date}</span>
                    <span style={{ color: '#34d399', fontWeight: '700' }}>Unlocked ✓</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL VIDEO PLAYER */}
        {selectedVideo && hasAccess && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem'
          }}>
            <div style={{
              background: '#090d16',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '24px',
              maxWidth: '850px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 30px 70px rgba(0, 0, 0, 0.9)'
            }}>
              <div style={{
                padding: '1rem 1.6rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>{selectedVideo.title}</h3>
                <button
                  onClick={() => setSelectedVideo(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: 'none',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontWeight: '800'
                  }}
                >
                  ✕ Close
                </button>
              </div>

              <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', background: '#000' }}>
                <iframe
                  src={selectedVideo.embed_url}
                  title={selectedVideo.title}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                />
              </div>

              <div style={{ padding: '1.2rem 1.6rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                Instructor: <strong style={{ color: '#fff' }}>{selectedVideo.instructor_name}</strong> • Level: <strong style={{ color: '#38bdf8' }}>{selectedVideo.level}</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}