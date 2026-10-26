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

  async function finalizeSubscription(planId, planName, amount, paymentId) {
    try {
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
          end_date: endDate
        }
      ]);

      if (subErr) throw subErr;

      await refreshUserData(user.id);
      setMsg(`🎉 ${planName} unlocked successfully! Redirecting to studio...`);

      setTimeout(() => {
        navigate('/today');
      }, 1500);
    } catch (err) {
      setMsg(`Subscription Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handlePayment(planId, planName, amount) {
    if (!user) {
      alert('Please log in or sign up before purchasing a pass.');
      navigate('/login');
      return;
    }

    if (isStaff) {
      alert(`As ${role.toUpperCase()}, you have permanent staff access clearance.`);
      return;
    }

    setLoading(true);
    setMsg('');

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    const hasValidKey = razorpayKey && razorpayKey.startsWith('rzp_') && !razorpayKey.includes('YourTestKeyId');

    // If Razorpay API key is not yet set in production, activate developer fallback
    if (!hasValidKey) {
      const mockPayId = `pay_simulated_${Date.now()}`;
      await finalizeSubscription(planId, planName, amount, mockPayId);
      return;
    }

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) throw new Error('Razorpay gateway failed to load.');

      const options = {
        key: razorpayKey,
        amount: Math.round(Number(amount) * 100),
        currency: 'INR',
        name: 'YogaLive Broadcasts',
        description: `${planName} Subscription`,
        prefill: {
          name: profile?.name || user.email.split('@')[0],
          email: user.email,
          contact: profile?.phone || '+919876543210'
        },
        theme: {
          color: '#0284c7'
        },
        handler: async function (response) {
          const paymentId = response.razorpay_payment_id || `pay_${Date.now()}`;
          await finalizeSubscription(planId, planName, amount, paymentId);
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', function (resp) {
        setMsg(`Payment failed: ${resp.error?.description || 'Declined'}`);
        setLoading(false);
      });
      rzpInstance.open();
    } catch (err) {
      setMsg(`Gateway Error: ${err.message}`);
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
            OFFICIAL SUBSCRIPTION TIERS
          </span>
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.8px', margin: '0 0 0.6rem 0' }}>
          Select Your Practice Pass
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '640px', margin: '0 auto 2rem auto' }}>
          1st Day is 100% Free for all new subscribers. Choose a tier below to unlock Day 2 onward and full library recordings.
        </p>

        {isDemoActive && !subscription && !isStaff && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#fbbf24',
            padding: '0.8rem 1.2rem',
            borderRadius: '12px',
            maxWidth: '650px',
            margin: '0 auto 2rem auto',
            fontSize: '0.88rem',
            fontWeight: '600'
          }}>
            ✨ Day 1 Free Trial Active! You can attend live sessions and chat freely today. Pick a pass below for Day 2 continuation and library vault access.
          </div>
        )}

        {isStaff && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '12px',
            padding: '1.2rem',
            marginBottom: '2rem'
          }}>
            <h4 style={{ margin: '0 0 4px 0', color: '#fb7185', fontSize: '1.05rem', fontWeight: '800' }}>
              🛡️ Staff Access Clearance
            </h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
              Logged in as <strong>{role.toUpperCase()}</strong>. You hold full system privileges and do not require paid passes.
            </p>
          </div>
        )}

        {subscription && !isStaff && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            padding: '0.85rem',
            borderRadius: '10px',
            marginBottom: '2rem',
            fontWeight: '700',
            fontSize: '0.9rem'
          }}>
            ✓ Active Subscription: <strong>{subscription.plan_id.toUpperCase()} PASS</strong> (Expires: {new Date(subscription.end_date).toLocaleDateString()})
          </div>
        )}

        {msg && (
          <div style={{
            background: msg.includes('unlocked') || msg.includes('successful') ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: msg.includes('unlocked') || msg.includes('successful') ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
            color: msg.includes('unlocked') || msg.includes('successful') ? '#34d399' : '#f87171',
            padding: '0.8rem',
            borderRadius: '10px',
            marginBottom: '2rem',
            fontSize: '0.88rem'
          }}>
            {msg}
          </div>
        )}

        {/* 3 TIERS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '24px',
          marginTop: '1rem'
        }}>
          {/* TIER 1 */}
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
                FOUNDATION TIER
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0.3rem 0 0.8rem 0' }}>Beginner & Hatha</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: '900', color: '#f8fafc', margin: '0 0 0.8rem 0' }}>
                ₹299<span style={{ fontSize: '1rem', color: '#64748b' }}> / month</span>
              </p>
              <ul style={{ color: '#94a3b8', fontSize: '0.86rem', lineHeight: 1.8, paddingLeft: '1.2rem', margin: '0 0 1.5rem 0' }}>
                <li>Day 2+ live access to Beginner Surya Namaskar</li>
                <li>Hatha posture alignment & guided breathwork</li>
                <li>Live interactive posture doubts chat</li>
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
              {isStaff ? 'Staff Exempt' : 'Activate Foundation (₹299)'}
            </button>
          </div>

          {/* TIER 2 */}
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
                VINYASA FLOW TIER
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0.3rem 0 0.8rem 0' }}>Intermediate Flow</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: '900', color: '#f8fafc', margin: '0 0 0.8rem 0' }}>
                ₹599<span style={{ fontSize: '1rem', color: '#64748b' }}> / month</span>
              </p>
              <ul style={{ color: '#94a3b8', fontSize: '0.86rem', lineHeight: 1.8, paddingLeft: '1.2rem', margin: '0 0 1.5rem 0' }}>
                <li>Everything in Foundation Tier</li>
                <li>Dynamic Vinyasa Flow morning & evening</li>
                <li>Spinal mobility & core conditioning</li>
                <li>Direct live posture feedback from master</li>
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
              {isStaff ? 'Staff Exempt' : 'Activate Vinyasa (₹599)'}
            </button>
          </div>

          {/* TIER 3: MASTERY ALL-ACCESS */}
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
                  MASTERY ALL-ACCESS
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '2px 8px', borderRadius: '4px' }}>
                  INCLUDES VAULT
                </span>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0.3rem 0 0.8rem 0' }}>Full Yoga Pass</h3>
              <p style={{ fontSize: '2.5rem', fontWeight: '900', color: '#f8fafc', margin: '0 0 0.8rem 0' }}>
                ₹999<span style={{ fontSize: '1rem', color: '#64748b' }}> / month</span>
              </p>
              <ul style={{ color: '#94a3b8', fontSize: '0.86rem', lineHeight: 1.8, paddingLeft: '1.2rem', margin: '0 0 1.5rem 0' }}>
                <li>All Beginner, Intermediate & Advanced live sessions</li>
                <li><strong>Exclusive 24/7 Access to On-Demand Recorded Library</strong></li>
                <li>WhatsApp class alerts directly from coordinator</li>
                <li>Full habit streak tracking</li>
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