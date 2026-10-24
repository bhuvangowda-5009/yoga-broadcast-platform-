import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Admin({ profile }) {
  const [profiles, setProfiles] = useState([]);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const { data } = await supabase.from('yoga_profiles').select('*');
    if (data) setProfiles(data);
  }

  async function handleRoleChange(userId, newRole) {
    await supabase.from('yoga_profiles').update({ role: newRole }).eq('id', userId);
    setNotice(`Updated user role to ${newRole}`);
    loadUsers();
  }

  function simulateDispatch(type) {
    setNotice(`🚀 Notification dispatched: ${type} delivered successfully!`);
  }

  if (profile?.role !== 'admin') {
    return <div style={{ padding: '3rem', textAlign: 'center' }}><h3>Access Denied. Admin permissions required.</h3></div>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>🛡️ Admin Management Dashboard</h2>
      {notice && <p style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.6rem', borderRadius: '4px' }}>{notice}</p>}

      <div style={{ display: 'flex', gap: '1rem', margin: '1.5rem 0', flexWrap: 'wrap' }}>
        <button onClick={() => simulateDispatch('WhatsApp Broadcast')} style={{ padding: '0.6rem 1rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          📲 Send WhatsApp Practice Reminder
        </button>
        <button onClick={() => simulateDispatch('SMS OTP / Session Link')} style={{ padding: '0.6rem 1rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          💬 Dispatch SMS Session Notification
        </button>
        <button onClick={() => simulateDispatch('Email Verification Check')} style={{ padding: '0.6rem 1rem', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          ✉️ Trigger Email Verification Ping
        </button>
      </div>

      <h3>User Base & Access Governance</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#f1f5f9' }}>
            <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Name</th>
            <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Email</th>
            <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Role</th>
            <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>Change Role</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((p, index) => (
            <tr key={`${p.id}-${index}`}>
              <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{p.full_name || 'User'}</td>
              <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>{p.email}</td>
              <td style={{ padding: '8px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>{p.role}</td>
              <td style={{ padding: '8px', border: '1px solid #cbd5e1' }}>
                <select value={p.role} onChange={(e) => handleRoleChange(p.id, e.target.value)} style={{ padding: '4px' }}>
                  <option value="subscriber">Subscriber</option>
                  <option value="instructor">Instructor</option>
                  <option value="coordinator">Coordinator</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}