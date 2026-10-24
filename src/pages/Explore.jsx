import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import LiveChat from '../components/LiveChat';

export default function Explore({ user, profile, onUpgradeSuccess }) {
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [activeSession, setActiveSession] = useState(null);

  // Demo Timer States (120 seconds)
  const [demoTimeLeft, setDemoTimeLeft] = useState(120);
  const [demoLocked, setDemoLocked] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [search, category]);

  async function fetchSessions() {
    let query = supabase.from('yoga_sessions').select('*').order('created_at', { ascending: false });
    if (search.trim()) query = query.ilike('title', `%${search}%`);
    if (category !== 'All') query = query.eq('category', category);
    const { data } = await query;
    if (data) setSessions(data);
  }

  // Timer countdown when free subscriber enters session
  useEffect(() => {
    let timer = null;
    if (activeSession && profile?.subscription_status !== 'paid') {
      setDemoTimeLeft(120);
      setDemoLocked(false);

      timer = setInterval(() => {
        setDemoTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setDemoLocked(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeSession, profile]);

  async function handleUnlock() {
    const confirmed = window.confirm("Unlock unlimited uninterrupted live classes for ₹499?");
    if (confirmed) {
      await supabase.from('yoga_profiles').update({ subscription_status: 'paid' }).eq('id', user.id);
      setDemoLocked(false);
      onUpgradeSuccess();
      alert("Payment verified! Unlimited session access unlocked.");
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1050px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>🔍 Search & Live Broadcast Classes</h2>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by title (e.g. Vinyasa, Morning Flow)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '260px', padding: '0.6rem 0.8rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: '0.6rem 1rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
          <option value="All">All Categories</option>
          <option value="Hatha">Hatha</option>
          <option value="Vinyasa">Vinyasa</option>
          <option value="Ashtanga">Ashtanga</option>
          <option value="Pranayama">Pranayama</option>
          <option value="Yin">Yin</option>
        </select>
      </div>

      {/* BROADCAST CONTAINER */}
      {activeSession && (
        <div style={{ marginBottom: '2.5rem', padding: '1.5rem', background: '#0f172a', color: '#fff', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 4px 0' }}>🔴 LIVE BROADCAST: {activeSession.title}</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                Instructor: {activeSession.instructor_name} | {activeSession.category}
              </p>
            </div>
            <button onClick={() => setActiveSession(null)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Close Stream</button>
          </div>

          {/* DEMO TIMER BANNER */}
          {profile?.subscription_status !== 'paid' && (
            <div style={{ background: demoLocked ? '#ef4444' : '#eab308', color: '#000', padding: '0.5rem 1rem', borderRadius: '4px', margin: '0.8rem 0', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{demoLocked ? '⚠️ Free Demo Expired! Access Locked.' : `⏳ Free Demo Active: ${Math.floor(demoTimeLeft / 60)}:${demoTimeLeft % 60 < 10 ? '0' : ''}${demoTimeLeft % 60} remaining`}</span>
              <button onClick={handleUnlock} style={{ padding: '0.3rem 0.8rem', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Pay & Unlock Forever
              </button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            {/* VIDEO FEED OR PAYWALL BLOCK */}
            <div style={{ background: '#000', borderRadius: '6px', overflow: 'hidden', height: '360px', position: 'relative' }}>
              {demoLocked ? (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '2rem', background: 'rgba(0,0,0,0.85)' }}>
                  <h3 style={{ color: '#f87171' }}>Free Demo Limit Reached</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '350px' }}>To continue following this yoga session and future daily classes, please upgrade to a paid membership.</p>
                  <button onClick={handleUnlock} style={{ padding: '0.7rem 1.4rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Pay ₹499 & Continue Practice
                  </button>
                </div>
              ) : (
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/v7AYKMP6rOE?autoplay=1&mute=1"
                  title="Live Yoga Stream"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            <LiveChat sessionId={activeSession.id} user={user} />
          </div>
        </div>
      )}

      {/* SESSIONS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {sessions.map((s, index) => (
          <div key={`${s.id}-${index}`} style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1.2rem', background: '#fff' }}>
            <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', background: s.is_live ? '#fee2e2' : '#e0f2fe', color: s.is_live ? '#b91c1c' : '#0369a1', fontWeight: 'bold' }}>
              {s.is_live ? '● BROADCASTING' : 'SCHEDULED'}
            </span>
            <h3 style={{ margin: '0.6rem 0 0.4rem 0' }}>{s.title}</h3>
            <p style={{ fontSize: '0.85rem', color: '#475569', minHeight: '38px' }}>{s.description || 'Daily instructor-led practice session.'}</p>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Instructor: <strong>{s.instructor_name}</strong> ({s.category})</p>
            <button
              onClick={() => setActiveSession(s)}
              style={{ marginTop: '0.5rem', width: '100%', padding: '0.6rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Enter Practice Room
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}