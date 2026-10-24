import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function LiveChat({ sessionId, user }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    loadMessages();

    const channel = supabase
      .channel(`chat-room-${sessionId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'yoga_chat_messages', 
        filter: `session_id=eq.${sessionId}` 
      }, (payload) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  async function loadMessages() {
    const { data } = await supabase
      .from('yoga_chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!newMsg.trim() || !user) return;
    setLoading(true);

    const { error } = await supabase.from('yoga_chat_messages').insert([{
      session_id: sessionId,
      user_id: user.id,
      sender_name: user.user_metadata?.full_name || user.email.split('@')[0],
      message: newMsg.trim()
    }]);

    if (!error) {
      setNewMsg('');
      loadMessages();
    }
    setLoading(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: '#1e293b', borderRadius: '6px', padding: '0.8rem', height: '360px' }}>
      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#38bdf8' }}>Live Posture Q&A</h4>
      
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '4px' }}>
        {messages.length === 0 && (
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>No questions yet. Ask your instructor!</p>
        )}
        {messages.map((m, index) => (
          <div key={`${m.id || 'msg'}-${index}`} style={{ background: '#334155', padding: '5px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
            <strong style={{ color: '#7dd3fc' }}>{m.sender_name}:</strong> {m.message}
          </div>
        ))}
      </div>

      {user ? (
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
          <input
            type="text"
            placeholder="Ask question..."
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: 'none', fontSize: '0.85rem' }}
          />
          <button 
            type="submit" 
            disabled={loading} 
            style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '0.5rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}
          >
            Send
          </button>
        </form>
      ) : (
        <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#f87171' }}>Login to chat with instructor</p>
      )}
    </div>
  );
}