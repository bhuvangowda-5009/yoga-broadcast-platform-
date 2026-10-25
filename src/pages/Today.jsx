import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function Today() {
  const { user, profile, subscription, isDemoActive } = useAuth();
  const [liveSession, setLiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [attendanceLogged, setAttendanceLogged] = useState(false);
  const chatEndRef = useRef(null);
  const attendanceMarkedRef = useRef(false);

  const role = profile?.role || 'subscriber';
  const isStaffOrAdmin = role === 'admin' || role === 'instructor' || role === 'coordinator';

  // Level access hierarchy
  function checkPracticeAccess(sessionLevel, userPlanId) {
    if (isStaffOrAdmin || isDemoActive) return true;
    if (!subscription) return false;

    const currentPlan = userPlanId || subscription.plan_id;
    if (currentPlan === 'all_access') return true;

    const level = (sessionLevel || 'All Levels').toLowerCase();
    if (currentPlan === 'vinyasa') {
      return level === 'beginner' || level === 'intermediate' || level === 'all levels';
    }
    if (currentPlan === 'foundation') {
      return level === 'beginner' || level === 'all levels';
    }
    return true;
  }

  const hasAccess = checkPracticeAccess(liveSession?.level, subscription?.plan_id);

  useEffect(() => {
    let sessionChannel = null;
    let chatChannel = null;

    async function initializeStudio() {
      let { data: session } = await supabase
        .from('sessions')
        .select('*')
        .eq('is_live', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!session) {
        const { data: fallback } = await supabase
          .from('sessions')
          .select('*')
          .eq('id', '00000000-0000-0000-0000-000000000001')
          .maybeSingle();
        session = fallback;
      }

      if (session) {
        setLiveSession(session);

        const { data: msgHistory } = await supabase
          .from('yoga_chat_messages')
          .select('*')
          .eq('session_id', session.id)
          .order('created_at', { ascending: true });

        if (msgHistory) setMessages(msgHistory);

        const chatChannelName = `chat_${session.id}_${Math.random().toString(36).substring(2, 9)}`;
        chatChannel = supabase
          .channel(chatChannelName)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'yoga_chat_messages',
              filter: `session_id=eq.${session.id}`
            },
            (payload) => {
              if (payload?.new) {
                setMessages((prev) => {
                  if (prev.some((m) => m.id === payload.new.id)) return prev;
                  return [...prev, payload.new];
                });
              }
            }
          )
          .subscribe();

        if (user && !attendanceMarkedRef.current) {
          attendanceMarkedRef.current = true;
          supabase
            .from('attendance')
            .select('id')
            .eq('user_id', user.id)
            .eq('session_id', session.id)
            .maybeSingle()
            .then(({ data: att }) => {
              if (!att) {
                supabase
                  .from('attendance')
                  .insert([{ user_id: user.id, session_id: session.id }])
                  .then(() => setAttendanceLogged(true));
              } else {
                setAttendanceLogged(true);
              }
            });
        }
      }

      const sessionChannelName = `session_updates_${Math.random().toString(36).substring(2, 9)}`;
      sessionChannel = supabase
        .channel(sessionChannelName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'sessions' },
          (payload) => {
            if (payload?.new && payload.new.is_live) {
              setLiveSession(payload.new);
            }
          }
        )
        .subscribe();
    }

    initializeStudio();

    return () => {
      if (sessionChannel) supabase.removeChannel(sessionChannel);
      if (chatChannel) supabase.removeChannel(chatChannel);
    };
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSendChat(e) {
    e.preventDefault();
    if (!newMsg.trim() || !user || !liveSession?.id || !hasAccess) return;

    const textToSend = newMsg.trim();
    setNewMsg('');

    const senderDisplay = profile?.name || user.email.split('@')[0];

    const { error } = await supabase.from('yoga_chat_messages').insert([
      {
        session_id: liveSession.id,
        user_id: user.id,
        sender_name: senderDisplay,
        message: textToSend
      }
    ]);

    if (error) {
      console.error('Chat error:', error.message);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 0%, #172554 0%, #090d16 60%, #030712 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#f8fafc',
      padding: '2.5rem 1.5rem 5rem 1.5rem'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* TOP STATUS BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.8rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '4px 12px',
                borderRadius: '20px'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 10px #ef4444' }}></span>
                <span style={{ fontSize: '0.72rem', fontWeight: '900', letterSpacing: '0.8px', color: '#f87171' }}>
                  SYNCHRONOUS STUDIO BROADCAST
                </span>
              </div>

              {isDemoActive && !subscription && !isStaffOrAdmin && (
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  color: '#fbbf24',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  padding: '4px 10px',
                  borderRadius: '20px'
                }}>
                  ✨ DAY 1 FREE DEMO PASS ACTIVE
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-0.8px', margin: '0 0 0.4rem 0' }}>
              Today's Live Practice
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', margin: 0 }}>
              Live instruction for <strong style={{ color: '#38bdf8' }}>{liveSession?.level || 'All Levels'}</strong> practitioners.
            </p>
          </div>

          {attendanceLogged && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '8px 16px',
              borderRadius: '12px',
              color: '#34d399',
              fontSize: '0.82rem',
              fontWeight: '700'
            }}>
              <span>✓ Attendance Logged</span>
              <span style={{ color: '#6ee7b7' }}>• Daily Streak Updated</span>
            </div>
          )}
        </div>

        {/* ACCESS CHECK */}
        {!hasAccess ? (
          <div style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '24px',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
            padding: '4rem 2rem',
            textAlign: 'center',
            maxWidth: '640px',
            margin: '3rem auto'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              marginBottom: '1.2rem'
            }}>
              🔒
            </div>
            <h2 style={{ fontSize: '1.7rem', fontWeight: '800', margin: '0 0 0.6rem 0' }}>
              {isDemoActive ? 'Tier Upgrade Required' : 'Free Demo Expired'}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '480px', margin: '0 auto 2rem auto' }}>
              {!subscription
                ? 'Your 1st-Day Free Trial window has concluded. Please select a practice tier to continue joining live broadcasts.'
                : `This session requires access clearance for "${liveSession?.level || 'Advanced'}" level flows. Upgrade your pass to join.`}
            </p>
            <Link
              to="/pricing"
              style={{
                display: 'inline-block',
                padding: '0.9rem 2.2rem',
                borderRadius: '12px',
                background: '#0284c7',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: '800',
                fontSize: '0.95rem',
                boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.5)'
              }}
            >
              View Practice Tiers & Upgrade →
            </Link>
          </div>
        ) : (
          /* LIVE STUDIO VIEWPORT & CHAT */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 380px',
            gap: '24px',
            alignItems: 'start'
          }}>
            {/* BROADCASTER PLAYER */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              overflow: 'hidden',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)'
            }}>
              <div style={{
                padding: '1.2rem 1.6rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', fontWeight: '800' }}>
                    {liveSession?.title || 'Daily Surya & Pranayama Stream'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                    Instructor: <strong style={{ color: '#38bdf8' }}>{liveSession?.instructor_name || 'Acharya Dev'}</strong> • Difficulty: <strong style={{ color: '#34d399' }}>{liveSession?.level || 'All Levels'}</strong>
                  </p>
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(34, 197, 94, 0.12)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: '800',
                  color: '#4ade80'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }}></span>
                  BROADCASTING
                </div>
              </div>

              <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', background: '#000' }}>
                <iframe
                  src={liveSession?.stream_url || 'https://meet.jit.si/YogaLive_Permanent_MainStudio'}
                  title="YogaLive Studio Player"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                  allow="camera; microphone; fullscreen; display-capture; autoplay"
                  allowFullScreen
                />
              </div>

              <div style={{
                padding: '1rem 1.6rem',
                background: 'rgba(0, 0, 0, 0.35)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.8rem',
                color: '#64748b'
              }}>
                <span>Session: {liveSession?.id ? liveSession.id.substring(0, 16) + '...' : 'Main Studio'}</span>
                <span>WebRTC Mesh • Two-Way Audio Active</span>
              </div>
            </div>

            {/* LIVE POSTURE Q&A CHAT */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              display: 'flex',
              flexDirection: 'column',
              height: '620px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '1.2rem 1.4rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '800' }}>Live Posture Q&A</h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                    {isDemoActive && !subscription ? 'Demo User Access Active' : 'Verified Member Channel'}
                  </p>
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                  {messages.length} MSGS
                </span>
              </div>

              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', margin: 'auto 0', color: '#64748b', fontSize: '0.85rem' }}>
                    <p style={{ margin: 0 }}>No questions posted yet.</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.76rem' }}>Type below to ask instructor about your posture.</p>
                  </div>
                ) : (
                  messages.map((m, idx) => {
                    const isSelf = m.user_id === user?.id;
                    return (
                      <div
                        key={m.id || idx}
                        style={{
                          background: isSelf ? 'rgba(2, 132, 199, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                          border: isSelf ? '1px solid rgba(2, 132, 199, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '12px',
                          padding: '8px 12px',
                          maxWidth: '90%',
                          alignSelf: isSelf ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '2px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: '800', color: isSelf ? '#38bdf8' : '#cbd5e1' }}>
                            {m.sender_name}
                          </span>
                          <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                            {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.86rem', color: '#f8fafc', lineHeight: 1.45 }}>
                          {m.message}
                        </p>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendChat} style={{
                padding: '0.9rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                gap: '8px',
                background: 'rgba(0, 0, 0, 0.25)'
              }}>
                <input
                  type="text"
                  placeholder="Ask instructor about asana alignment..."
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.9rem',
                    fontSize: '0.86rem',
                    color: '#fff',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '0.65rem 1.1rem',
                    background: '#0284c7',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '800',
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}