import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function Coordinator() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [msg, setMsg] = useState('');
  const [sendingId, setSendingId] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setSessions(data);
  }

  async function handleApprove(id) {
    await supabase.from('sessions').update({ status: 'approved' }).eq('id', id);
    setMsg('Session marked as Approved!');
    loadSessions();
  }

  async function triggerReminder(session) {
    setSendingId(session.id);
    setMsg('');

    const alertMessage = `🧘 YogaLive Alert: "${session.title}" (${session.level}) with ${session.instructor_name} begins in 30 minutes! Open your app to join the live stream: ${window.location.origin}/today`;
    const targetPhone = '+919876543210';

    try {
      const isDeployed =
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1';

      if (isDeployed) {
        try {
          await fetch('/api/send-whatsapp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: targetPhone, message: alertMessage })
          });
        } catch (err) {
          console.warn('Vercel API fallback:', err);
        }
      }

      // Record notification entry in Supabase
      await supabase.from('notifications').insert([
        {
          user_id: user?.id,
          type: 'whatsapp',
          message: alertMessage
        }
      ]);

      // Direct WhatsApp Web trigger for local demo and testing
      const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
      const encodedText = encodeURIComponent(alertMessage);
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;
      
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      setMsg(`✅ WhatsApp alert logged for "${session.title}" and WhatsApp Web triggered.`);
    } catch (err) {
      setMsg(`Error sending WhatsApp notification: ${err.message}`);
    } finally {
      setSendingId(null);
    }
  }

  return (
    <div style={{ maxWidth: '950px', margin: '2rem auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a' }}>📋 Coordinator Schedule Portal</h2>
          <p style={{ color: '#64748b', margin: '0.4rem 0 0 0' }}>
            Review instructor submissions, approve classes, and broadcast WhatsApp alerts to subscribers.
          </p>
        </div>
        <button
          onClick={loadSessions}
          style={{ padding: '0.5rem 1rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          🔄 Refresh
        </button>
      </div>

      {msg && (
        <div style={{
          background: msg.includes('Error') ? '#fee2e2' : '#dcfce7',
          color: msg.includes('Error') ? '#b91c1c' : '#15803d',
          padding: '0.8rem 1rem',
          borderRadius: '6px',
          marginBottom: '1.2rem',
          fontWeight: '500'
        }}>
          {msg}
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
              <th style={{ padding: '12px 16px' }}>Session Title</th>
              <th style={{ padding: '12px 16px' }}>Instructor</th>
              <th style={{ padding: '12px 16px' }}>Level</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  No sessions found. Have an instructor schedule a class first!
                </td>
              </tr>
            ) : (
              sessions.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#1e293b' }}>{s.title}</td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>{s.instructor_name}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', background: '#e0f2fe', color: '#0369a1', fontWeight: 'bold' }}>
                      {s.level}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      background: s.status === 'approved' ? '#dcfce7' : '#fef3c7',
                      color: s.status === 'approved' ? '#166534' : '#92400e'
                    }}>
                      {s.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {s.status !== 'approved' && (
                      <button
                        onClick={() => handleApprove(s.id)}
                        style={{ padding: '6px 12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => triggerReminder(s)}
                      disabled={sendingId === s.id}
                      style={{
                        padding: '6px 12px',
                        background: '#25D366',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: sendingId === s.id ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {sendingId === s.id ? 'Dispatching...' : '💬 Send WhatsApp Alert'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}