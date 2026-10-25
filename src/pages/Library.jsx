import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Library() {
  const { profile, subscription } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  const role = profile?.role || 'subscriber';
  const hasAccess = !!subscription || role === 'admin' || role === 'instructor' || role === 'coordinator';

  // Seed default high-grade recorded masterclasses if database is fresh
  const defaultRecordings = [
    {
      id: 'rec-1',
      title: 'Sunrise Ashtanga Primary Series & Bandha Alignment',
      instructor_name: 'Acharya Dev',
      level: 'Intermediate',
      duration: '45 mins',
      date: 'Oct 23, 2026',
      thumbnail: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=700&q=80',
      embed_url: 'https://www.youtube.com/embed/v7AYKMP6rOE'
    },
    {
      id: 'rec-2',
      title: 'Deep Pranayama & Kundalini Breathwork Workshop',
      instructor_name: 'Mira Devi',
      level: 'All Levels',
      duration: '35 mins',
      date: 'Oct 22, 2026',
      thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=700&q=80',
      embed_url: 'https://www.youtube.com/embed/inpok4MKVLM'
    },
    {
      id: 'rec-3',
      title: 'Vinyasa Flow: Core Strength & Spinal Mobility',
      instructor_name: 'Arjun Varma',
      level: 'Advanced',
      duration: '60 mins',
      date: 'Oct 21, 2026',
      thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=700&q=80',
      embed_url: 'https://www.youtube.com/embed/b1H3xO3x_Js'
    },
    {
      id: 'rec-4',
      title: 'Gentle Evening Restorative & Nidra Meditation',
      instructor_name: 'Acharya Dev',
      level: 'Beginner',
      duration: '30 mins',
      date: 'Oct 20, 2026',
      thumbnail: 'https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?auto=format&fit=crop&w=700&q=80',
      embed_url: 'https://www.youtube.com/embed/4pLUleLdwY4'
    }
  ];

  useEffect(() => {
    async function loadSessions() {
      setLoading(true);
      const { data } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        // Merge DB sessions with metadata
        const formatted = data.map((s, idx) => ({
          id: s.id,
          title: s.title || 'Recorded Masterclass Flow',
          instructor_name: s.instructor_name || 'Acharya Dev',
          level: s.level || 'All Levels',
          duration: '45 mins',
          date: s.created_at ? new Date(s.created_at).toLocaleDateString() : 'Archived',
          thumbnail: defaultRecordings[idx % defaultRecordings.length].thumbnail,
          embed_url: s.stream_url?.includes('embed') ? s.stream_url : 'https://www.youtube.com/embed/v7AYKMP6rOE'
        }));
        setSessions(formatted);
      } else {
        setSessions(defaultRecordings);
      }
      setLoading(false);
    }

    loadSessions();
  }, []);

  const filteredSessions = activeFilter === 'All' 
    ? sessions 
    : sessions.filter(s => s.level.toLowerCase() === activeFilter.toLowerCase());

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
              Access our complete catalog of archived daily broadcasts, pranayama drills, and guided flows.
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

        {/* ACCESS WARNING FOR UNPAID SUBSCRIBERS */}
        {!hasAccess && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '16px',
            padding: '1.2rem 1.6rem',
            marginBottom: '2.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h4 style={{ margin: '0 0 2px 0', color: '#f87171', fontSize: '0.95rem', fontWeight: '800' }}>
                🔒 High-Definition Vault Locked
              </h4>
              <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.84rem' }}>
                Archived masterclasses require an active membership pass or staff credentials.
              </p>
            </div>
            <Link
              to="/pricing"
              style={{
                padding: '6px 16px',
                borderRadius: '8px',
                background: '#0284c7',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: '800',
                fontSize: '0.8rem'
              }}
            >
              Unlock Vault Passes →
            </Link>
          </div>
        )}

        {/* VIDEO CARDS GRID */}
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
                transition: 'transform 0.2s ease, border-color 0.2s ease',
                cursor: hasAccess ? 'pointer' : 'default'
              }}
              onClick={() => {
                if (hasAccess) setSelectedVideo(rec);
              }}
              onMouseEnter={(e) => {
                if (hasAccess) {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.35)';
                }
              }}
              onMouseLeave={(e) => {
                if (hasAccess) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                }
              }}
            >
              {/* THUMBNAIL */}
              <div style={{ position: 'relative', width: '100%', height: '170px', background: '#000', overflow: 'hidden' }}>
                <img
                  src={rec.thumbnail}
                  alt={rec.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: hasAccess ? 0.85 : 0.4 }}
                />
                <span style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(0, 0, 0, 0.65)',
                  backdropFilter: 'blur(8px)',
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
                  backdropFilter: 'blur(6px)',
                  color: '#f8fafc',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: '700'
                }}>
                  {rec.duration}
                </span>

                {hasAccess && (
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
                )}
              </div>

              {/* DETAILS */}
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
                  <span>Archived: {rec.date}</span>
                  <span style={{ color: hasAccess ? '#34d399' : '#f87171', fontWeight: '700' }}>
                    {hasAccess ? 'Ready to Replay' : 'Pass Required'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL VIDEO PLAYER */}
        {selectedVideo && (
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
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div style={{ padding: '1.2rem 1.6rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                Lead Master: <strong style={{ color: '#fff' }}>{selectedVideo.instructor_name}</strong> • Level: <strong style={{ color: '#38bdf8' }}>{selectedVideo.level}</strong> • Full Practice Replay
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}