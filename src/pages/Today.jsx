import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function Today() {
  const { user, profile, subscription } = useAuth();
  const [liveSession, setLiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [attendanceLogged, setAttendanceLogged] = useState(false);

  const attendanceMarkedRef = useRef(false);

  useEffect(() => {
    let sessionChannel = null;
    let chatChannel = null;

    async function initializeStudio() {
      // 1. Fetch current live session or fallback to permanent session record
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

        // Fetch previous message history
        const { data: msgHistory } = await supabase
          .from('yoga_chat_messages')
          .select('*')
          .eq('session_id', session.id)
          .order('created_at', { ascending: true });

        if (msgHistory) setMessages(msgHistory);

        // Subscribe to real-time chat with a unique channel name per mount
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

        // 2. Mark attendance once per user login session
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

      // 3. Track live session status updates
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

  async function handleSendChat(e) {
    e.preventDefault();
    if (!newMsg.trim() || !user || !liveSession?.id) return;

    const textToSend = newMsg.trim();
    setNewMsg('');

    const { error } = await supabase.from('yoga_chat_messages').insert([
      {
        session_id: liveSession.id,
        user_id: user.id,
        sender_name: profile?.name || user.email.split('@')[0],
        message: textToSend
      }
    ]);

    if (error) {
      console.error('Chat send error:', error.message);
    }
  }

  const isPaid =
    subscription ||
    profile?.role === 'admin' ||
    profile?.role === 'coordinator' ||
    profile?.role === 'instructor';

  return (
    <div style={{ maxWidth: '1100px', margin: '2rem auto', padding: '1rem', fontFamily: 'sans-serif' }}>
      <h2>Today's Live Practice</h2>

      {!isPaid ? (
        <div style={{ padding: '3rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', textAlign: 'center' }}>
          <h3 style={{ color: '#b91c1c' }}>🔒 Subscription Required</h3>
          <p style={{ color: '#64748b', maxWidth: '500px', margin: '0.5rem auto 1.5rem' }}>
            Daily live stream broadcast and instructor posture Q&A are reserved for active members.
          </p>
          <Link to="/pricing" style={{ padding: '0.7rem 1.4rem', background: '#16a34a', color: '#fff', textDecoration: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
            Choose a Pass to Unlock →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.2rem', marginTop: '1rem' }}>
          {/* PERMANENT LIVE BROADCAST PLAYER */}
          <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', color: '#fff' }}>
            <h3>🔴 Broadcasting: {liveSession?.title || 'Daily Surya Flow'}</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              Instructor: {liveSession?.instructor_name || 'Acharya Dev'} | Level: {liveSession?.level || 'All Levels'}
            </p>
            <div style={{ background: '#000', borderRadius: '6px', height: '420px', overflow: 'hidden', marginTop: '0.8rem' }}>
              <iframe
                src={liveSession?.stream_url || 'https://meet.jit.si/YogaLive_Permanent_MainStudio'}
                title="YogaLive Permanent Broadcast Studio"
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                allowFullScreen
              />
            </div>
            {attendanceLogged && (
              <p style={{ color: '#4ade80', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                ✓ Attendance logged for today. Streak updated!
              </p>
            )}
          </div>

          {/* REALTIME CHAT */}
          <div style={{ background: '#1e293b', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', height: '480px', color: '#fff' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#38bdf8' }}>Live Posture Q&A</h4>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {messages.length === 0 && (
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>No messages yet. Ask a question!</p>
              )}
              {messages.map((m, i) => (
                <div key={m.id || i} style={{ background: '#334155', padding: '6px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                  <strong style={{ color: '#7dd3fc' }}>{m.sender_name}: </strong>{m.message}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
              <input
                type="text"
                placeholder="Ask instructor..."
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: 'none' }}
              />
              <button type="submit" style={{ padding: '0.5rem 0.8rem', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}