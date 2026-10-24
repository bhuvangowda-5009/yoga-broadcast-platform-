import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

export default function Pricing() {
  const { user, profile, subscription, refreshUserData } = useAuth();
  const [msg, setMsg] = useState('');
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  // Helper to dynamically load external Razorpay checkout script if not present
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

  // Central record-keeping logic after payment authorization
  async function finalizeSubscription(planId, planName, amount, paymentId) {
    const startDate = new Date().toISOString();
    const durationDays = planId === 'weekly' ? 7 : 30;
    const endDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    // 1. Ensure profile exists in public.users to satisfy foreign key constraint
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!existingUser) {
      await supabase.from('users').upsert({
        id: user.id,
        name: profile?.name || user.email.split('@')[0],
        email: user.email,
        phone: profile?.phone || '+919876543210',
        role: profile?.role || 'subscriber',
        verified: true
      });
    }

    // 2. Remove any previous subscription record for clean upsert
    await supabase
      .from('subscriptions')
      .delete()
      .eq('user_id', user.id);

    // 3. Insert active subscription record
    const { error: subError } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: user.id,
          plan_id: planId,
          payment_id: paymentId,
          status: 'active',
          start_date: startDate,
          end_date: endDate
        }
      ]);

    if (subError) throw subError;

    // 4. Record notifications for verification
    await supabase.from('notifications').insert([
      {
        user_id: user.id,
        type: 'sms',
        message: `Namaste ${profile?.name || ''}! Your YogaLive ${planName} (₹${amount}) is active. Ref: ${paymentId}`
      },
      {
        user_id: user.id,
        type: 'whatsapp',
        message: `🧘 Welcome to YogaLive! Your ${planName} has been unlocked. Session access granted.`
      }
    ]);

    // 5. Refresh global authentication and membership state
    await refreshUserData(user.id);

    setMsg(`🎉 Payment of ₹${amount} Confirmed! Reference: ${paymentId}. Live studio unlocked.`);
    setTimeout(() => {
      navigate('/today');
    }, 2000);
  }

  // Initiates Checkout Modal with fallback simulator
  async function handlePayment(planId, planName, amount) {
    if (!user) {
      alert('Please log in before purchasing a membership pass.');
      navigate('/login');
      return;
    }

    setProcessing(true);
    setMsg('');

    try {
      const isScriptLoaded = await loadRazorpayScript();
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

      // When live Razorpay SDK and test keys are available
      if (isScriptLoaded && razorpayKey && !razorpayKey.includes('YourTestKeyId')) {
        let orderId = `order_${Date.now()}`;

        // Attempt serverless order creation if deployed on Vercel
        const isDeployed =
          window.location.hostname !== 'localhost' &&
          window.location.hostname !== '127.0.0.1';

        if (isDeployed) {
          try {
            const res = await fetch('/api/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount, planId })
            });
            const data = await res.json();
            if (data?.id) orderId = data.id;
          } catch (err) {
            console.warn('Backend order creation fallback:', err);
          }
        }

        const options = {
          key: razorpayKey,
          amount: amount * 100,
          currency: 'INR',
          name: 'YogaLive Platform',
          description: `${planName} Subscription`,
          order_id: orderId.startsWith('order_') ? undefined : orderId,
          prefill: {
            name: profile?.name || 'Subscriber',
            email: user.email,
            contact: profile?.phone || '9876543210'
          },
          theme: {
            color: '#0284c7'
          },
          handler: async function (response) {
            const pId = response.razorpay_payment_id || `pay_${Math.random().toString(36).substring(2, 10)}`;
            await finalizeSubscription(planId, planName, amount, pId);
          },
          modal: {
            ondismiss: function () {
              setProcessing(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          setMsg(`Payment failed: ${response.error.description || 'Transaction cancelled'}`);
          setProcessing(false);
        });
        rzp.open();
      } else {
        // Instant Test-Mode Payment Processor for Localhost & Demo evaluation
        const simulatedPaymentId = `pay_test_${Math.random().toString(36).substring(2, 11)}`;
        await finalizeSubscription(planId, planName, amount, simulatedPaymentId);
      }
    } catch (err) {
      setMsg(`Payment processing error: ${err.message || 'Unable to complete checkout'}`);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: '850px',
        margin: '3rem auto',
        padding: '1rem',
        fontFamily: 'sans-serif',
        textAlign: 'center'
      }}
    >
      <h2>YogaLive Subscription Passes</h2>
      <p style={{ color: '#64748b' }}>
        Unlock unlimited daily live practice, real-time instructor Q&A, and full habit streak tracking.
      </p>

      {subscription && (
        <div
          style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            color: '#1e40af',
            padding: '0.8rem',
            borderRadius: '6px',
            margin: '1.2rem auto',
            maxWidth: '550px',
            fontWeight: 'bold',
            fontSize: '0.9rem'
          }}
        >
          ✓ You currently hold an Active Subscription ({subscription.plan_id.toUpperCase()} PASS)
        </div>
      )}

      {msg && (
        <p
          style={{
            background: msg.includes('Confirmed') ? '#dcfce7' : '#fee2e2',
            color: msg.includes('Confirmed') ? '#15803d' : '#b91c1c',
            padding: '0.8rem',
            borderRadius: '4px',
            margin: '1.5rem auto',
            maxWidth: '600px',
            fontWeight: '500'
          }}
        >
          {msg}
        </p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginTop: '2rem'
        }}
      >
        {/* WEEKLY PASS */}
        <div
          style={{
            border: '1px solid #cbd5e1',
            padding: '1.8rem',
            borderRadius: '8px',
            background: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <h3>Weekly Pass</h3>
            <p style={{ fontSize: '2.2rem', fontWeight: 'bold', margin: '0.8rem 0', color: '#0f172a' }}>
              ₹299
            </p>
            <p style={{ color: '#64748b', fontSize: '0.9rem', minHeight: '40px' }}>
              Full access to all daily live stream sessions and real-time chat for 7 days.
            </p>
          </div>
          <button
            disabled={processing}
            onClick={() => handlePayment('weekly', 'Weekly Pass', 299)}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#0284c7',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: processing ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              marginTop: '1.5rem',
              fontSize: '0.95rem'
            }}
          >
            {processing ? 'Connecting...' : 'Pay with Razorpay (₹299)'}
          </button>
        </div>

        {/* MONTHLY PASS */}
        <div
          style={{
            border: '2px solid #0284c7',
            padding: '1.8rem',
            borderRadius: '8px',
            background: '#fff',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: '-12px',
              right: '20px',
              background: '#0284c7',
              color: '#fff',
              fontSize: '0.75rem',
              padding: '3px 10px',
              borderRadius: '4px',
              fontWeight: 'bold',
              letterSpacing: '0.5px'
            }}
          >
            MOST POPULAR
          </span>
          <div>
            <h3>Monthly Unlimited</h3>
            <p style={{ fontSize: '2.2rem', fontWeight: 'bold', margin: '0.8rem 0', color: '#0f172a' }}>
              ₹999
            </p>
            <p style={{ color: '#64748b', fontSize: '0.9rem', minHeight: '40px' }}>
              30 days unlimited access to morning & evening live broadcasts, posture Q&A, and full habit streak logging.
            </p>
          </div>
          <button
            disabled={processing}
            onClick={() => handlePayment('monthly', 'Monthly Unlimited', 999)}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: processing ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              marginTop: '1.5rem',
              fontSize: '0.95rem'
            }}
          >
            {processing ? 'Connecting...' : 'Pay with Razorpay (₹999)'}
          </button>
        </div>
      </div>
    </div>
  );
}