import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, profile, subscription, refreshUserData } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [consecutiveStreak, setConsecutiveStreak] = useState(0);
  const [phoneInput, setPhoneInput] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadProfileAndHabits();
    }
  }, [user]);

  useEffect(() => {
    if (profile?.phone) {
      setPhoneInput(profile.phone);
    }
  }, [profile]);

  async function loadProfileAndHabits() {
    try {
      const { data: attData, error } = await supabase
        .from('attendance')
        .select(`
          id,
          created_at,
          session_id,
          sessions (
            id,
            title
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      if (attData) {
        const sorted = [...attData].sort((a, b) => {
          const timeA = new Date(a.created_at || 0).getTime();
          const timeB = new Date(b.created_at || 0).getTime();
          return timeB - timeA;
        });

        setAttendance(sorted);
        calculateDynamicStreak(sorted);
      }
    } catch (err) {
      console.error('Error loading attendance history:', err.message);
    }
  }

  function calculateDynamicStreak(records) {
    if (!records || records.length === 0) {
      setConsecutiveStreak(0);
      return;
    }

    const uniqueDates = Array.from(
      new Set(
        records
          .filter((r) => r.created_at)
          .map((r) => new Date(r.created_at).toISOString().split('T')[0])
      )
    ).sort().reverse();

    if (uniqueDates.length === 0) {
      setConsecutiveStreak(records.length > 0 ? 1 : 0);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
      setConsecutiveStreak(0);
      return;
    }

    let streak = 0;
    let expectedDate = new Date(uniqueDates[0]);

    for (const dateStr of uniqueDates) {
      const currentDate = new Date(dateStr);
      const diffInDays = Math.round(
        (expectedDate - currentDate) / (1000 * 60 * 60 * 24)
      );

      if (diffInDays === 0) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }

    setConsecutiveStreak(streak);
  }

  async function handleUpdatePhone(e) {
    e.preventDefault();
    if (!phoneInput.trim()) return;

    setSaving(true);
    setMsg('');

    try {
      const { error } = await supabase
        .from('users')
        .update({ phone: phoneInput.trim() })
        .eq('id', user.id);

      if (error) throw error;

      await refreshUserData(user.id);
      setIsEditingPhone(false);
      setMsg('✅ Alert phone contact updated successfully!');
    } catch (err) {
      setMsg(`Failed to update contact: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  const role = profile?.role || 'subscriber';
  const isStaff = role === 'admin' || role === 'instructor' || role === 'coordinator';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 0%, #172554 0%, #090d16 60%, #030712 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#f8fafc',
      padding: '3rem 1.5rem 6rem 1.5rem'
    }}>
      <div style={{ maxWidth: '980px', margin: '0 auto' }}>
        {/* HEADER */}
        <div style={{ marginBottom: '2.5rem' }}>
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
              {isStaff ? 'STAFF IDENTITY & DIRECTORY' : 'PRACTITIONER PROFILE & HABITS'}
            </span>
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: '900', letterSpacing: '-0.8px', margin: '0 0 0.4rem 0' }}>
            {role === 'admin' ? 'Chief Administrator Workspace' : role === 'instructor' ? 'Instructor Profile' : role === 'coordinator' ? 'Coordinator Profile' : 'Subscriber Profile & Tracking'}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
            {isStaff ? 'Full system bypass active. Unrestricted access to broadcasts, controls, and platform tools.' : 'Manage your contact details and track your daily live attendance streak.'}
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

        {/* PROFILE CARD */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 50px -15px rgba(0, 0, 0, 0.6)',
          padding: '2rem 2.4rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', letterSpacing: '0.8px' }}>
              ACCOUNT NAME
            </span>
            <p style={{ margin: '0.3rem 0 1.2rem 0', fontSize: '1.25rem', fontWeight: '800', color: '#f8fafc' }}>
              {profile?.name || user?.email?.split('@')[0]}
            </p>

            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', letterSpacing: '0.8px' }}>
              SYSTEM EMAIL
            </span>
            <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.95rem', color: '#cbd5e1', fontWeight: '500' }}>
              {user?.email}
            </p>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', letterSpacing: '0.8px' }}>
              CONTACT PHONE (WHATSAPP ALERTS)
            </span>

            {!isEditingPhone ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.3rem', marginBottom: '1.2rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#38bdf8' }}>
                  {profile?.phone || 'Not configured'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingPhone(true)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#94a3b8',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Edit Contact
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdatePhone} style={{ display: 'flex', gap: '8px', marginTop: '0.4rem', marginBottom: '1.2rem' }}>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+919876543210"
                  required
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    borderRadius: '8px',
                    padding: '0.45rem 0.8rem',
                    fontSize: '0.88rem',
                    color: '#fff',
                    outline: 'none',
                    width: '160px'
                  }}
                />
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '0.45rem 0.9rem',
                    background: '#10b981',
                    color: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '800',
                    fontSize: '0.78rem'
                  }}
                >
                  {saving ? '...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPhoneInput(profile?.phone || '');
                    setIsEditingPhone(false);
                  }}
                  style={{
                    padding: '0.45rem 0.8rem',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#94a3b8',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.78rem'
                  }}
                >
                  Cancel
                </button>
              </form>
            )}

            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', letterSpacing: '0.8px' }}>
              {isStaff ? 'SYSTEM CREDENTIAL' : 'MEMBERSHIP ACCESS PASS'}
            </span>
            <p style={{ margin: '0.3rem 0 0 0' }}>
              {role === 'admin' ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '900', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.35)', color: '#fb7185' }}>
                  🛡️ Chief Administrator (Full Bypass Access)
                </span>
              ) : role === 'instructor' ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '900', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#34d399' }}>
                  🧘 Certified Instructor (Studio Privileges)
                </span>
              ) : role === 'coordinator' ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '900', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.35)', color: '#c084fc' }}>
                  📋 Session Coordinator (Operations Clearance)
                </span>
              ) : subscription ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '900', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.35)', color: '#38bdf8' }}>
                  ✓ Active Paid Subscriber ({subscription.plan_id.toUpperCase()})
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '900', background: 'rgba(248, 113, 113, 0.12)', border: '1px solid rgba(248, 113, 113, 0.25)', color: '#f87171' }}>
                  ✕ Free Tier (No Active Pass)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* STREAK CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '2.5rem' }}>
          <div style={{
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.4) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '20px',
            padding: '2rem',
            textAlign: 'center',
            backdropFilter: 'blur(16px)'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: '0.8rem' }}>
              🔥
            </div>
            <h2 style={{ fontSize: '2.8rem', fontWeight: '900', margin: '0 0 0.2rem 0', color: '#fbbf24', letterSpacing: '-1px' }}>
              {consecutiveStreak} {consecutiveStreak === 1 ? 'Day' : 'Days'}
            </h2>
            <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: '800', letterSpacing: '0.8px', color: '#d97706' }}>
              DAILY PRACTICE STREAK
            </p>
          </div>

          <div style={{
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.4) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '20px',
            padding: '2rem',
            textAlign: 'center',
            backdropFilter: 'blur(16px)'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: '0.8rem' }}>
              🧘
            </div>
            <h2 style={{ fontSize: '2.8rem', fontWeight: '900', margin: '0 0 0.2rem 0', color: '#34d399', letterSpacing: '-1px' }}>
              {attendance.length}
            </h2>
            <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: '800', letterSpacing: '0.8px', color: '#059669' }}>
              SESSIONS ATTENDED
            </p>
          </div>
        </div>

        {/* ATTENDANCE TABLE */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          overflow: 'hidden',
          backdropFilter: 'blur(20px)'
        }}>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>Attendance History</h3>
            <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.84rem', color: '#64748b' }}>
              Live stream attendance records from public.attendance table.
            </p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0, 0, 0, 0.25)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.8px' }}>SESSION TITLE</th>
                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.8px' }}>DATE RECORDED</th>
                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.8px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ padding: '3rem 2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                    No sessions logged yet.
                  </td>
                </tr>
              ) : (
                attendance.map((att) => (
                  <tr key={att.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '16px 20px', fontWeight: '700', color: '#f8fafc', fontSize: '0.92rem' }}>
                      {att.sessions?.title || 'Daily Surya Flow Session'}
                    </td>
                    <td style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '0.86rem' }}>
                      {att.created_at ? new Date(att.created_at).toLocaleDateString() : 'Today'}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        color: '#34d399',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.76rem',
                        fontWeight: '800'
                      }}>
                        Completed ✓
                      </span>
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