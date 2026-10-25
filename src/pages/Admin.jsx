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
      setNotice(`Error loading directory: ${error.message}`);
    }
    setLoading(false);
  }

  async function handleApproveStaff(user) {
    const targetRole = user.applied_role || user.role;
    setNotice(`Authorizing ${user.email} as ${targetRole}...`);

    const { error } = await supabase
      .from('users')
      .update({
        role: targetRole,
        applied_role: null,
        is_approved: true
      })
      .eq('id', user.id);

    if (error) {
      setNotice(`Approval error: ${error.message}`);
    } else {
      setNotice(`✅ Authorized ${user.name || user.email} as ${targetRole.toUpperCase()}`);
      loadUsers();
    }
  }

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
      setNotice(`Rejection error: ${error.message}`);
    } else {
      setNotice(`Application rejected for ${user.email}. Role assigned to Subscriber.`);
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
      setNotice(`Role update error: ${error.message}`);
    } else {
      setNotice(`Role updated to '${newRole}'.`);
      loadUsers();
    }
  }

  const pendingStaff = users.filter((u) => {
    if (u.role === 'admin') return false;
    const hasApplied = u.applied_role === 'instructor' || u.applied_role === 'coordinator';
    const isUnapprovedStaff = (u.role === 'instructor' || u.role === 'coordinator') && !u.is_approved;
    return hasApplied || isUnapprovedStaff;
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 0%, #4c0519 0%, #090d16 60%, #030712 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#f8fafc',
      padding: '3rem 1.5rem 6rem 1.5rem'
    }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              padding: '4px 12px',
              borderRadius: '16px',
              marginBottom: '0.8rem'
            }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.8px', color: '#fb7185' }}>
                EXECUTIVE PERMISSIONS & IDENTITY DESK
              </span>
            </div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: '900', letterSpacing: '-0.8px', margin: '0 0 0.4rem 0' }}>
              Admin Central Control Panel
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
              Sole administrator authority to vet incoming staff, manage security clearances, and alter platform roles.
            </p>
          </div>

          <button
            onClick={loadUsers}
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
            🔄 Refresh Directory
          </button>
        </div>

        {notice && (
          <div style={{
            background: notice.includes('error') ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
            border: notice.includes('error') ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
            color: notice.includes('error') ? '#f87171' : '#34d399',
            padding: '0.85rem 1.2rem',
            borderRadius: '12px',
            fontSize: '0.86rem',
            fontWeight: '600',
            marginBottom: '2rem'
          }}>
            {notice}
          </div>
        )}

        {/* PENDING APPROVALS DOCK */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '20px',
          padding: '2rem',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 40px -10px rgba(245, 158, 11, 0.15)',
          marginBottom: '2.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#fbbf24', letterSpacing: '0.8px' }}>
                STAFF ACCESS CLEARANCES
              </span>
              <h3 style={{ margin: '0.2rem 0 0.2rem 0', fontSize: '1.3rem', fontWeight: '800' }}>
                Pending Review Queue ({pendingStaff.length})
              </h3>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#94a3b8' }}>
                Applicants who submitted credentials for Instructor or Coordinator positions.
              </p>
            </div>
          </div>

          {pendingStaff.length === 0 ? (
            <div style={{
              background: 'rgba(0, 0, 0, 0.25)',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center',
              color: '#34d399',
              fontSize: '0.88rem',
              fontWeight: '600'
            }}>
              ✓ All faculty and coordinator applications have been reviewed. Queue is clear.
            </div>
          ) : (
            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(0, 0, 0, 0.35)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: '800', color: '#94a3b8' }}>NAME</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: '800', color: '#94a3b8' }}>EMAIL</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: '800', color: '#94a3b8' }}>TARGET ROLE</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.74rem', fontWeight: '800', color: '#94a3b8' }}>DECISION</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingStaff.map((u) => {
                    const target = u.applied_role || u.role;
                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '14px 16px', fontWeight: '700', color: '#f8fafc', fontSize: '0.9rem' }}>
                          {u.name || 'Unnamed'}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#cbd5e1', fontSize: '0.86rem' }}>
                          {u.email}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: '800',
                            background: target === 'instructor' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                            color: target === 'instructor' ? '#34d399' : '#c084fc',
                            border: target === 'instructor' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(168, 85, 247, 0.3)'
                          }}>
                            {target?.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleApproveStaff(u)}
                              style={{
                                padding: '6px 14px',
                                background: '#10b981',
                                color: '#0f172a',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: '800',
                                fontSize: '0.78rem',
                                cursor: 'pointer'
                              }}
                            >
                              ✓ Authorize as {target}
                            </button>
                            <button
                              onClick={() => handleRejectStaff(u)}
                              style={{
                                padding: '6px 14px',
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#f87171',
                                borderRadius: '6px',
                                fontWeight: '700',
                                fontSize: '0.78rem',
                                cursor: 'pointer'
                              }}
                            >
                              ✕ Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ALL REGISTERED PLATFORM USERS */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          overflow: 'hidden',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 50px -15px rgba(0, 0, 0, 0.6)'
        }}>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>Platform Accounts Directory</h3>
            <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.84rem', color: '#64748b' }}>
              Full ledger of practitioners, instructors, and operational managers.
            </p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0, 0, 0, 0.3)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <th style={{ padding: '16px 20px', fontSize: '0.74rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.8px' }}>USER IDENTITY</th>
                <th style={{ padding: '16px 20px', fontSize: '0.74rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.8px' }}>EMAIL</th>
                <th style={{ padding: '16px 20px', fontSize: '0.74rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.8px' }}>ACTIVE ROLE</th>
                <th style={{ padding: '16px 20px', fontSize: '0.74rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.8px' }}>CLEARANCE</th>
                <th style={{ padding: '16px 20px', fontSize: '0.74rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.8px' }}>ASSIGN PRIVILEGES</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ padding: '3.5rem 2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                    Loading platform directory...
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isChiefAdmin = u.role === 'admin';
                  const isApproved = u.is_approved || u.role === 'subscriber' || isChiefAdmin;

                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '18px 20px', fontWeight: '700', color: '#f8fafc', fontSize: '0.92rem' }}>
                        {u.name || 'Unnamed'}
                      </td>
                      <td style={{ padding: '18px 20px', color: '#cbd5e1', fontSize: '0.88rem' }}>
                        {u.email}
                      </td>
                      <td style={{ padding: '18px 20px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          fontWeight: '800',
                          background: isChiefAdmin ? 'rgba(244, 63, 94, 0.15)' : u.role === 'instructor' ? 'rgba(16, 185, 129, 0.15)' : u.role === 'coordinator' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                          border: isChiefAdmin ? '1px solid rgba(244, 63, 94, 0.3)' : u.role === 'instructor' ? '1px solid rgba(16, 185, 129, 0.3)' : u.role === 'coordinator' ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid rgba(56, 189, 248, 0.3)',
                          color: isChiefAdmin ? '#fb7185' : u.role === 'instructor' ? '#34d399' : u.role === 'coordinator' ? '#c084fc' : '#38bdf8'
                        }}>
                          {u.role?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '18px 20px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          background: isApproved ? 'rgba(34, 197, 94, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                          border: isApproved ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                          color: isApproved ? '#4ade80' : '#fbbf24'
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isApproved ? '#22c55e' : '#f59e0b' }}></span>
                          {isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '18px 20px' }}>
                        {!isChiefAdmin ? (
                          <select
                            value={u.role}
                            onChange={(e) => handleManualRoleChange(u.id, e.target.value)}
                            style={{
                              background: 'rgba(0, 0, 0, 0.4)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              borderRadius: '8px',
                              padding: '0.4rem 0.8rem',
                              fontSize: '0.82rem',
                              color: '#fff',
                              outline: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="subscriber">Subscriber</option>
                            <option value="instructor">Instructor</option>
                            <option value="coordinator">Coordinator</option>
                          </select>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: '#fb7185', fontWeight: '800' }}>
                            Master Root
                          </span>
                        )}
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