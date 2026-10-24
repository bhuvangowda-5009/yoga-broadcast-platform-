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
      // 1. Fetch attendance records
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
        // Sort in memory by date descending to handle timestamp fallbacks cleanly
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

    // Filter unique calendar dates in YYYY-MM-DD
    const uniqueDates = Array.from(
      new Set(
        records
          .filter((r) => r.created_at)
          .map((r) => new Date(r.created_at).toISOString().split('T')[0])
      )
    ).sort().reverse();

    if (uniqueDates.length === 0) {
      // If records exist but have no valid date yet, fallback to at least 1 session
      setConsecutiveStreak(records.length > 0 ? 1 : 0);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // If user hasn't logged attendance today or yesterday, consecutive streak broke
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
      setMsg('✅ Phone number updated successfully!');
    } catch (err) {
      setMsg(`Failed to update phone: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: '850px',
        margin: '2.5rem auto',
        padding: '2rem',
        fontFamily: 'sans-serif',
        background: '#fff',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1.2rem', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: '0 0 0.4rem 0', color: '#0f172a' }}>
          Subscriber Profile & Habit Tracking
        </h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
          Manage your account information and monitor your live practice streak.
        </p>
      </div>

      {msg && (
        <div
          style={{
            background: msg.includes('Failed') ? '#fee2e2' : '#dcfce7',
            color: msg.includes('Failed') ? '#b91c1c' : '#15803d',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            marginBottom: '1.2rem',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}
        >
          {msg}
        </div>
      )}

      {/* USER DETAILS CARD */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.2rem',
          marginBottom: '2rem'
        }}
      >
        <div>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>
            Full Name
          </span>
          <p style={{ margin: '0.2rem 0 0.8rem 0', fontSize: '1.05rem', fontWeight: 'bold', color: '#1e293b' }}>
            {profile?.name || user?.email?.split('@')[0]}
          </p>

          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>
            Registered Email
          </span>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '1rem', color: '#334155' }}>
            {user?.email}
          </p>
        </div>

        <div>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>
            WhatsApp / Alert Phone
          </span>
          
          {!isEditingPhone ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.2rem', marginBottom: '0.8rem' }}>
              <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e293b' }}>
                {profile?.phone || 'Not configured'}
              </span>
              <button
                type="button"
                onClick={() => setIsEditingPhone(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0284c7',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.82rem',
                  textDecoration: 'underline'
                }}
              >
                Edit
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdatePhone} style={{ display: 'flex', gap: '6px', marginTop: '0.3rem', marginBottom: '0.8rem' }}>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="+919876543210"
                required
                style={{ padding: '0.4rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.9rem', width: '150px' }}
              />
              <button
                type="submit"
                disabled={saving}
                style={{ padding: '0.4rem 0.8rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.82rem' }}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPhoneInput(profile?.phone || '');
                  setIsEditingPhone(false);
                }}
                style={{ padding: '0.4rem 0.6rem', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.82rem' }}
              >
                Cancel
              </button>
            </form>
          )}

          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>
            Membership Status
          </span>
          <p style={{ margin: '0.2rem 0 0 0' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '0.82rem',
                fontWeight: 'bold',
                background: subscription ? '#dcfce7' : '#fee2e2',
                color: subscription ? '#166534' : '#b91c1c'
              }}
            >
              {subscription ? 'Active Paid Subscriber' : 'No Active Pass'}
            </span>
          </p>
        </div>
      </div>

      {/* DYNAMIC STREAK HERO CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '1.2rem', textAlign: 'center' }}>
          <span style={{ fontSize: '2rem' }}>🔥</span>
          <h3 style={{ margin: '0.4rem 0 0.2rem 0', color: '#1e40af', fontSize: '1.8rem' }}>
            {consecutiveStreak} {consecutiveStreak === 1 ? 'Day' : 'Days'}
          </h3>
          <p style={{ margin: 0, color: '#3b82f6', fontSize: '0.85rem', fontWeight: '600' }}>
            Current Daily Streak
          </p>
        </div>

        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '1.2rem', textAlign: 'center' }}>
          <span style={{ fontSize: '2rem' }}>🧘</span>
          <h3 style={{ margin: '0.4rem 0 0.2rem 0', color: '#166534', fontSize: '1.8rem' }}>
            {attendance.length}
          </h3>
          <p style={{ margin: 0, color: '#15803d', fontSize: '0.85rem', fontWeight: '600' }}>
            Total Sessions Completed
          </p>
        </div>
      </div>

      {/* ATTENDANCE HISTORY TABLE */}
      <h3 style={{ color: '#0f172a', marginBottom: '0.8rem' }}>Your Attendance History</h3>
      <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
              <th style={{ padding: '10px 14px', fontSize: '0.85rem', color: '#475569' }}>Session</th>
              <th style={{ padding: '10px 14px', fontSize: '0.85rem', color: '#475569' }}>Date</th>
              <th style={{ padding: '10px 14px', fontSize: '0.85rem', color: '#475569' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                  No sessions attended yet. Visit "Today's Practice" to join a live session!
                </td>
              </tr>
            ) : (
              attendance.map((att) => (
                <tr key={att.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 'bold', color: '#1e293b', fontSize: '0.9rem' }}>
                    {att.sessions?.title || 'Daily Surya Flow Session'}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '0.85rem' }}>
                    {att.created_at ? new Date(att.created_at).toLocaleDateString() : 'Today'}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 'bold' }}>
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
  );
}