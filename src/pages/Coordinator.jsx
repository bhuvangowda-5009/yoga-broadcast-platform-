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

      await supabase.from('notifications').insert([
        {
          user_id: user?.id,
          type: 'whatsapp',
          message: alertMessage
        }
      ]);

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
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 0%, #3b0764 0%, #090d16 60%, #030712 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#f8fafc',
      padding: '3rem 1.5rem 6rem 1.5rem'
    }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(168, 85, 247, 0.12)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              padding: '4px 12px',
              borderRadius: '16px',
              marginBottom: '0.8rem'
            }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.8px', color: '#c084fc' }}>
                OPERATIONS & DISPATCH DESK
              </span>
            </div>
            <h1 style={{ fontSize: '2.3rem', fontWeight: '900', letterSpacing: '-0.8px', margin: '0 0 0.4rem 0' }}>
              Coordinator Schedule Portal
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
              Review instructor proposals, certify broadcast statuses, and trigger subscriber WhatsApp reminders.
            </p>
          </div>

          <button
            onClick={loadSessions}
            style={{
              padding: '0.65rem 1.2rem',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#cbd5e1',
              fontWeight: '700',
              fontSize: '0.84rem',
              cursor: 'pointer'
            }}
          >
            🔄 Refresh Registry
          </button>
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

        {/* SESSIONS TABLE */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          overflow: 'hidden',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 50px -15px rgba(0, 0, 0, 0.6)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0, 0, 0, 0.3)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <th style={{ padding: '16px 20px', fontSize: '0.74rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.8px' }}>SESSION TITLE</th>
                <th style={{ padding: '16px 20px', fontSize: '0.74rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.8px' }}>INSTRUCTOR</th>
                <th style={{ padding: '16px 20px', fontSize: '0.74rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.8px' }}>TIER</th>
                <th style={{ padding: '16px 20px', fontSize: '0.74rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.8px' }}>STATUS</th>
                <th style={{ padding: '16px 20px', fontSize: '0.74rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.8px' }}>DISPATCH ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '3.5rem 2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                    No sessions logged. Have an instructor configure a broadcast first.
                  </td>
                </tr>
              ) : (
                sessions.map((s) => {
                  const isApproved = s.status === 'approved';
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '18px 20px', fontWeight: '700', color: '#f8fafc', fontSize: '0.92rem' }}>
                        {s.title}
                      </td>
                      <td style={{ padding: '18px 20px', color: '#cbd5e1', fontSize: '0.88rem' }}>
                        {s.instructor_name}
                      </td>
                      <td style={{ padding: '18px 20px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          background: 'rgba(56, 189, 248, 0.1)',
                          border: '1px solid rgba(56, 189, 248, 0.25)',
                          color: '#38bdf8',
                          fontWeight: '800'
                        }}>
                          {s.level}
                        </span>
                      </td>
                      <td style={{ padding: '18px 20px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '3px 10px',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          fontWeight: '800',
                          background: isApproved ? 'rgba(34, 197, 94, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                          border: isApproved ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                          color: isApproved ? '#4ade80' : '#fbbf24'
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isApproved ? '#22c55e' : '#f59e0b' }}></span>
                          {s.status?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '18px 20px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {!isApproved && (
                            <button
                              onClick={() => handleApprove(s.id)}
                              style={{
                                padding: '6px 12px',
                                background: '#0284c7',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '800',
                                fontSize: '0.76rem'
                              }}
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
                              color: '#0f172a',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: sendingId === s.id ? 'not-allowed' : 'pointer',
                              fontWeight: '800',
                              fontSize: '0.76rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {sendingId === s.id ? 'Dispatching...' : '💬 Send WhatsApp Alert'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}