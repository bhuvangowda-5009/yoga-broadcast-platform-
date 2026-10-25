import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

export default function Pricing() {
  const { user, profile, subscription, isDemoActive, refreshUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const role = profile?.role || 'subscriber';
  const isStaff = role === 'admin' || role === 'instructor' || role === 'coordinator';

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  async function handlePayment(planId, planName, amount) {
    if (!user) {
      alert('Please log in to purchase a practice pass.');
      navigate('/login');
      return;
    }

    if (isStaff) {
      alert(`As ${role.toUpperCase()}, you hold permanent staff access clearance.`);
      return;
    }

    setLoading(true);
    setMsg('');

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) throw new Error('Razorpay SDK failed to load.');

      const isLocalhost =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';

      let orderId = `order_local_${Date.now()}`;

      if (!isLocalhost) {
        try {
          const orderRes = await fetch('/api/create-razorpay-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, planId }),
          });
          const orderData = await orderRes.json();
          if (orderData.id) orderId = orderData.id;
        } catch (err) {
          console.warn('Backend order fallback:', err);
        }
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyId',
        amount: amount * 100,
        currency: 'INR',
        name: 'YogaLive Studio',
        description: `${planName} Subscription`,
        order_id: orderId.startsWith('order_local_') ? undefined : orderId,
        prefill: {
          name: profile?.name || user.email.split('@')[0],
          email: user.email,
          contact: profile?.phone || '9876543210',
        },
        theme: {
          color: '#0284c7',
        },
        handler: async function (response) {
          try {
            const paymentId = response.razorpay_payment_id || `pay_${Date.now()}`;
            const startDate = new Date().toISOString();
            const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

            await supabase.from('subscriptions').delete().eq('user_id', user.id);

            const { error: subErr } = await supabase.from('subscriptions').insert([
              {
                user_id: user.id,
                plan_id: planId,
                payment_id: paymentId,
                status: 'active',
                start_date: startDate,
                end_date: endDate,
              },
            ]);

            if (subErr) throw subErr;

            await supabase.from('notifications').insert([
              {
                user_id: user.id,
                type: 'sms',
                message: `Namaste! Your YogaLive ${planName} is active. Ref: ${paymentId}`,
              },
            ]);

            await refreshUserData(user.id);
            setMsg(`🎉 Payment of ₹${amount} successful! Unlocking ${planName}...`);

            setTimeout(() => {
              navigate('/today');
            }, 1500);
          } catch (err) {
            setMsg(`Activation Error: ${err.message}`);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.open();
    } catch (err) {
      setMsg(`Error launching checkout: ${err.message}`);
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 0%, #172554 0%, #090d16 60%, #030712 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#f8fafc',
      padding: '3rem 1.5rem 6rem 1.5rem'
    }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          padding: '4px 12px',
          borderRadius: '16px',
          marginBottom: '1rem'
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.8px', color: '#38bdf8' }}>
            PRACTICE LEVEL PRICING ALLOCATIONS
          </span>
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.8px', margin: '0 0 0.6rem 0' }}>
          Choose Your Practice Tier
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '640px', margin: '0 auto 2rem auto' }}>
          Tailored subscriptions for your yoga journey. Every account starts with a <strong>1-Day Free Trial</strong> for all live practices.
        </p>

        {/* DEMO NOTICE */}
        {isDemoActive && !subscription && !isStaff && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#fbbf24',
            padding: '0.8rem 1.2rem',
            borderRadius: '12px',
            marginBottom: '2rem',
            maxWidth: '650px',
            margin: '0 auto 2rem auto',
            fontSize: '0.88rem',
            fontWeight: '600'
          }}>
            ✨ Day 1 Free Demo Active! You can join any live studio practice today without payment. Select a tier below for uninterrupted access.
          </div>
        )}

        {isStaff && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '12px',
            padding: '1.2rem',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            <h4 style={{ margin: '0 0 4px 0', color: '#fb7185', fontSize: '1.05rem', fontWeight: '800' }}>
              🛡️ Staff Access Clearance Active
            </h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
              You are logged in as <strong>{role.toUpperCase()}</strong>. You hold universal studio and library clearance.
            </p>
          </div>
        )}

        {subscription && !isStaff && (
          <div style={{
            background: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: '#38bdf8',
            padding: '0.85rem',
            borderRadius: '10px',
            marginBottom: '2rem',
            fontWeight: '700',
            fontSize: '0.9rem'
          }}>
            ✓ Active Subscription: <strong>{subscription.plan_id.toUpperCase()} TIER</strong> (Valid until {new Date(subscription.end_date).toLocaleDateString()})
          </div>
        )}

        {msg && (
          <div style={{
            background: msg.includes('successful') ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: msg.includes('successful') ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
            color: msg.includes('successful') ? '#34d399' : '#f87171',
            padding: '0.8rem',
            borderRadius: '10px',
            marginBottom: '2rem',
            fontSize: '0.88rem'
          }}>
            {msg}
          </div>
        )}

        {/* 3 PRACTICE-LEVEL TIERS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '24px',
          marginTop: '1rem'
        }}>
          {/* TIER 1: FOUNDATION */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '2.2rem',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            textAlign: 'left'
          }}>
            <div>
              <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#38bdf8', letterSpacing: '0.8px' }}>
                LEVEL 1: BEGINNER
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0.3rem 0 0.8rem 0' }}>Foundation Tier</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: '900', color: '#f8fafc', margin: '0 0 0.8rem 0' }}>
                ₹299<span style={{ fontSize: '1rem', color: '#64748b' }}> / month</span>
              </p>
              <ul style={{ color: '#94a3b8', fontSize: '0.86rem', lineHeight: 1.8, paddingLeft: '1.2rem', margin: '0 0 1.5rem 0' }}>
                <li>Daily Beginner Morning Surya Namaskar</li>
                <li>Hatha Yoga Alignment & Posture basics</li>
                <li>Daily Pranayama (Breathwork) sessions</li>
                <li>Live Chat instructor Q&A</li>
                <li style={{ color: '#64748b' }}>✕ Library recordings not included</li>
              </ul>
            </div>
            <button
              disabled={loading || isStaff}
              onClick={() => handlePayment('foundation', 'Foundation Tier', 299)}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '10px',
                border: 'none',
                background: isStaff ? '#334155' : '#0284c7',
                color: isStaff ? '#94a3b8' : '#fff',
                fontWeight: '800',
                cursor: (loading || isStaff) ? 'not-allowed' : 'pointer'
              }}
            >
              {isStaff ? 'Staff Exempt' : 'Select Foundation (₹299)'}
            </button>
          </div>

          {/* TIER 2: VINYASA FLOW */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            borderRadius: '20px',
            padding: '2.2rem',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            textAlign: 'left'
          }}>
            <div>
              <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#38bdf8', letterSpacing: '0.8px' }}>
                LEVEL 2: INTERMEDIATE
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0.3rem 0 0.8rem 0' }}>Vinyasa Flow Tier</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: '900', color: '#f8fafc', margin: '0 0 0.8rem 0' }}>
                ₹599<span style={{ fontSize: '1rem', color: '#64748b' }}> / month</span>
              </p>
              <ul style={{ color: '#94a3b8', fontSize: '0.86rem', lineHeight: 1.8, paddingLeft: '1.2rem', margin: '0 0 1.5rem 0' }}>
                <li>Everything in Foundation Tier</li>
                <li>Dynamic Vinyasa Flow morning & evening</li>
                <li>Spinal mobility & core conditioning</li>
                <li>Real-time posture feedback via chat</li>
                <li style={{ color: '#64748b' }}>✕ Library recordings not included</li>
              </ul>
            </div>
            <button
              disabled={loading || isStaff}
              onClick={() => handlePayment('vinyasa', 'Vinyasa Flow Tier', 599)}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '10px',
                border: 'none',
                background: isStaff ? '#334155' : '#0284c7',
                color: isStaff ? '#94a3b8' : '#fff',
                fontWeight: '800',
                cursor: (loading || isStaff) ? 'not-allowed' : 'pointer'
              }}
            >
              {isStaff ? 'Staff Exempt' : 'Select Vinyasa (₹599)'}
            </button>
          </div>

          {/* TIER 3: MASTERY ALL-ACCESS (INCLUDES ON-DEMAND LIBRARY) */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '20px',
            padding: '2.2rem',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            textAlign: 'left',
            boxShadow: '0 0 35px -10px rgba(16, 185, 129, 0.2)'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#34d399', letterSpacing: '0.8px' }}>
                  LEVEL 3: ADVANCED + VAULT
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '2px 8px', borderRadius: '4px' }}>
                  MOST COMPLETE
                </span>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0.3rem 0 0.8rem 0' }}>Mastery All-Access</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: '900', color: '#f8fafc', margin: '0 0 0.8rem 0' }}>
                ₹999<span style={{ fontSize: '1rem', color: '#64748b' }}> / month</span>
              </p>
              <ul style={{ color: '#94a3b8', fontSize: '0.86rem', lineHeight: 1.8, paddingLeft: '1.2rem', margin: '0 0 1.5rem 0' }}>
                <li>Unrestricted access to all Beginner, Intermediate & Advanced live sessions</li>
                <li>Ashtanga Primary Series & Bandha alignment</li>
                <li><strong>Exclusive 24/7 access to On-Demand Library Recordings</strong></li>
                <li>WhatsApp & SMS automated reminders</li>
                <li>Full habit streak analytics</li>
              </ul>
            </div>
            <button
              disabled={loading || isStaff}
              onClick={() => handlePayment('all_access', 'Mastery All-Access', 999)}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '10px',
                border: 'none',
                background: isStaff ? '#334155' : '#10b981',
                color: isStaff ? '#94a3b8' : '#0f172a',
                fontWeight: '800',
                cursor: (loading || isStaff) ? 'not-allowed' : 'pointer'
              }}
            >
              {isStaff ? 'Staff Exempt' : 'Unlock All-Access (₹999)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}