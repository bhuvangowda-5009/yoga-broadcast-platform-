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
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUsers(data);
    } else if (error) {
      setNotice(`Error loading users: ${error.message}`);
    }
    setLoading(false);
  }

  // Handle Staff Approval: promotes user to the requested applied_role and marks is_approved = true
  async function handleApproveStaff(user) {
    const targetRole = user.applied_role || user.role;
    setNotice(`Approving ${user.email} as ${targetRole}...`);

    const { error } = await supabase
      .from('users')
      .update({
        role: targetRole,
        applied_role: null,
        is_approved: true
      })
      .eq('id', user.id);

    if (error) {
      setNotice(`Approval failed: ${error.message}`);
    } else {
      setNotice(`✅ Successfully approved ${user.name || user.email} as ${targetRole.toUpperCase()}!`);
      loadUsers();
    }
  }

  // Handle Rejection: keeps user as regular subscriber and clears application
  async function handleRejectStaff(user) {
    const { error } = await supabase
      .from('users')
      .update({
        role: 'subscriber',
        applied_role: null,
        is_approved: true
      })
      .eq('id', user.id);

    if (error) {
      setNotice(`Rejection failed: ${error.message}`);
    } else {
      setNotice(`Rejected application for ${user.email}. Role reverted to Subscriber.`);
      loadUsers();
    }
  }

  async function handleManualRoleChange(userId, newRole) {
    const { error } = await supabase
      .from('users')
      .update({
        role: newRole,
        applied_role: null,
        is_approved: true
      })
      .eq('id', userId);

    if (error) {
      setNotice(`Failed to update role: ${error.message}`);
    } else {
      setNotice(`Updated role to '${newRole}'.`);
      loadUsers();
    }
  }

  // Pending applications: anyone with an active applied_role OR role is instructor/coord without approval
  const pendingStaff = users.filter((u) => {
    if (u.role === 'admin') return false;
    const hasApplied = u.applied_role === 'instructor' || u.applied_role === 'coordinator';
    const isUnapprovedStaff = (u.role === 'instructor' || u.role === 'coordinator') && !u.is_approved;
    return hasApplied || isUnapprovedStaff;
  });

  return (
    <div style={{ maxWidth: '1050px', margin: '2rem auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a' }}>🛡️ Admin Management & Approvals</h2>
          <p style={{ color: '#64748b', margin: '0.4rem 0 0 0' }}>
            Review staff applications, approve instructors & coordinators, and manage platform permissions.
          </p>
        </div>
        <button
          onClick={loadUsers}
          style={{ padding: '0.5rem 1rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          🔄 Refresh
        </button>
      </div>

      {notice && (
        <div style={{
          background: notice.includes('failed') || notice.includes('Error') ? '#fee2e2' : '#dcfce7',
          color: notice.includes('failed') || notice.includes('Error') ? '#b91c1c' : '#15803d',
          padding: '0.75rem 1rem',
          borderRadius: '6px',
          marginBottom: '1.5rem',
          fontWeight: '500'
        }}>
          {notice}
        </div>
      )}

      {/* PENDING APPROVALS SECTION */}
      <div style={{ background: '#fff', border: '2px solid #f59e0b', borderRadius: '8px', padding: '1.2rem', marginBottom: '2rem' }}>
        <h3 style={{ margin: '0 0 0.4rem 0', color: '#b45309' }}>
          ⏳ Pending Staff Approvals ({pendingStaff.length})
        </h3>
        <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.85rem' }}>
          These users submitted applications to become Instructors or Coordinators. They cannot enter the studio until approved.
        </p>

        {pendingStaff.length === 0 ? (
          <p style={{ color: '#16a34a', margin: 0, fontSize: '0.9rem', fontStyle: 'italic' }}>
            ✓ No pending applications. All staff requests have been processed.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#fef3c7' }}>
                <th style={{ padding: '8px 12px', fontSize: '0.85rem' }}>Name</th>
                <th style={{ padding: '8px 12px', fontSize: '0.85rem' }}>Email</th>
                <th style={{ padding: '8px 12px', fontSize: '0.85rem' }}>Applied Role</th>
                <th style={{ padding: '8px 12px', fontSize: '0.85rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingStaff.map((u) => {
                const targetRole = u.applied_role || u.role;
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid #fef3c7' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 'bold' }}>{u.name || 'Unnamed'}</td>
                    <td style={{ padding: '10px 12px', color: '#475569' }}>{u.email}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem', background: '#e0f2fe', color: '#0369a1', fontWeight: 'bold', textTransform: 'capitalize' }}>
                        {targetRole}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleApproveStaff(u)}
                        style={{ padding: '6px 14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.82rem' }}
                      >
                        ✓ Approve as {targetRole}
                      </button>
                      <button
                        onClick={() => handleRejectStaff(u)}
                        style={{ padding: '6px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.82rem' }}
                      >
                        ✕ Reject
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ALL REGISTERED PLATFORM USERS */}
      <h3 style={{ color: '#0f172a', marginBottom: '0.8rem' }}>All Platform Accounts</h3>
      <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
              <th style={{ padding: '12px 16px' }}>Name</th>
              <th style={{ padding: '12px 16px' }}>Email</th>
              <th style={{ padding: '12px 16px' }}>Current Role</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px' }}>Direct Role Assignment</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading user directory...</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{u.name || 'Unnamed'}</td>
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
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.78rem',
                      fontWeight: 'bold',
                      background: (u.is_approved || u.role === 'subscriber' || u.role === 'admin') ? '#dcfce7' : '#fef3c7',
                      color: (u.is_approved || u.role === 'subscriber' || u.role === 'admin') ? '#166534' : '#92400e'
                    }}>
                      {(u.is_approved || u.role === 'subscriber' || u.role === 'admin') ? 'Active / Approved' : 'Pending Review'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {u.role !== 'admin' ? (
                      <select
                        value={u.role}
                        onChange={(e) => handleManualRoleChange(u.id, e.target.value)}
                        style={{ padding: '0.35rem 0.6rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}
                      >
                        <option value="subscriber">subscriber</option>
                        <option value="instructor">instructor</option>
                        <option value="coordinator">coordinator</option>
                      </select>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 'bold' }}>Chief Admin</span>
                    )}
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