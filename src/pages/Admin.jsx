import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data);
    setLoading(false);
  }

  async function handleRoleChange(userId, newRole) {
    const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId);
    if (!error) {
      setNotice(`Updated role to '${newRole}' for user ${userId.substring(0, 8)}...`);
      loadUsers();
    }
  }

  return (
    <div style={{ maxWidth: '950px', margin: '2rem auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a' }}>🛡️ Admin Central Control Panel</h2>
          <p style={{ color: '#64748b', margin: '0.4rem 0 0 0' }}>Manage platform users, roles, and system permissions.</p>
        </div>
        <button
          onClick={loadUsers}
          style={{ padding: '0.5rem 1rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          🔄 Refresh
        </button>
      </div>

      {notice && (
        <p style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.7rem 1rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {notice}
        </p>
      )}

      <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
              <th style={{ padding: '12px 16px' }}>Name</th>
              <th style={{ padding: '12px 16px' }}>Email</th>
              <th style={{ padding: '12px 16px' }}>Current Role</th>
              <th style={{ padding: '12px 16px' }}>Promote / Demote</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>Loading user directory...</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{u.name}</td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>{u.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      background: u.role === 'admin' ? '#fee2e2' : u.role === 'instructor' ? '#d1fae5' : u.role === 'coordinator' ? '#f3e8ff' : '#e0f2fe',
                      color: u.role === 'admin' ? '#b91c1c' : u.role === 'instructor' ? '#065f46' : u.role === 'coordinator' ? '#6b21a8' : '#0369a1'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      style={{ padding: '0.35rem 0.6rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}
                    >
                      <option value="subscriber">subscriber</option>
                      <option value="instructor">instructor</option>
                      <option value="coordinator">coordinator</option>
                      <option value="admin">admin</option>
                    </select>
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