import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function UserDashboard({ user, profile, onUpgradeSuccess }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    supabase.from('yoga_notifications').select('*').order('created_at', { ascending: false }).limit(5).then(({ data }) => {
      if (data) setNotifications(data);
    });
  }, []);

  async function handleSimulatePayment() {
    const confirmed = window.confirm("Pay ₹499 via Razorpay to activate Unlimited Practice Access?");
    if (confirmed) {
      const { error } = await supabase.from('yoga_profiles').update({ subscription_status: 'paid' }).eq('id', user.id);
      if (!error) {
        alert("🎉 Payment Successful! Unlimited Access Unlocked.");
        onUpgradeSuccess();
      }
    }
  }

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>Welcome, {profile?.full_name || user?.email}! 🧘</h2>
      <p style={{ color: '#64748b' }}>Manage your practice habit, monitor session schedules, and manage your pass.</p>

      {/* MEMBERSHIP STATUS CARD */}
      <div style={{ background: profile?.subscription_status === 'paid' ? '#f0fdf4' : '#fffbeb', border: `1px solid ${profile?.subscription_status === 'paid' ? '#86efac' : '#fde68a'}`, padding: '1.5rem', borderRadius: '8px', margin: '1.5rem 0' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: profile?.subscription_status === 'paid' ? '#166534' : '#92400e' }}>
          Membership Status: {profile?.subscription_status === 'paid' ? 'Active Paid Subscriber (Full Unlimited Access)' : 'Free Demo Tier (2-Minute Class Preview)'}
        </h3>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#4b5563' }}>
          {profile?.subscription_status === 'paid' 
            ? 'You have complete uninterrupted access to all daily instructor broadcasts and real-time chat.'
            : 'You are on the free demo pass. You can watch 2 minutes of any live practice before access locks.'}
        </p>

        {profile?.subscription_status !== 'paid' && (
          <button onClick={handleSimulatePayment} style={{ padding: '0.6rem 1.2rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            ⚡ Upgrade to Unlimited Membership (₹499)
          </button>
        )}
      </div>

      {/* QUICK LINKS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ border: '1px solid #cbd5e1', padding: '1.2rem', borderRadius: '8px' }}>
          <h4>Today's Live Classes</h4>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Morning Vinyasa & Evening Pranayama classes are running live.</p>
          <Link to="/explore" style={{ color: '#0284c7', fontWeight: 'bold', textDecoration: 'none' }}>Go to Live Broadcast Room →</Link>
        </div>
        <div style={{ border: '1px solid #cbd5e1', padding: '1.2rem', borderRadius: '8px' }}>
          <h4>Browse Passes</h4>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>View all weekly and monthly subscription packages.</p>
          <Link to="/pricing" style={{ color: '#0284c7', fontWeight: 'bold', textDecoration: 'none' }}>View Pricing Table →</Link>
        </div>
      </div>

      {/* NOTIFICATIONS STREAM */}
      <h3>Platform Practice Notifications</h3>
      <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1rem' }}>
        {notifications.length === 0 ? <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No recent notifications.</p> : null}
        {notifications.map((n) => (
          <div key={n.id} style={{ borderBottom: '1px solid #e2e8f0', padding: '0.5rem 0' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#0284c7', marginRight: '8px' }}>[{n.type.toUpperCase()}]</span>
            <span style={{ fontSize: '0.9rem' }}>{n.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}