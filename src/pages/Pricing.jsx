import React, { useState } from 'react';

export default function Pricing({ user }) {
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  function handleFakeRazorpay(planName, amount) {
    if (!user) {
      alert('Please log in before purchasing a membership.');
      return;
    }
    const confirmed = window.confirm(`Initiate Razorpay Gateway for ${planName} (₹${amount})?`);
    if (confirmed) {
      setPaymentSuccess(true);
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '1rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2>Yoga Daily Practice Subscription Plans</h2>
      
      {paymentSuccess && (
        <div style={{ background: '#dcfce7', color: '#15803d', padding: '1rem', borderRadius: '6px', margin: '1rem 0' }}>
          🎉 <strong>Payment Verified!</strong> Your active membership is unlocked. You have unlimited live broadcast access.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1.5rem', background: '#fff' }}>
          <h3>Weekly Pass</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0.5rem 0' }}>₹299</p>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Access all live morning and evening sessions for 7 days.</p>
          <button 
            onClick={() => handleFakeRazorpay('Weekly Pass', 299)} 
            style={{ width: '100%', padding: '0.6rem', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Subscribe Now
          </button>
        </div>

        <div style={{ border: '2px solid #0284c7', borderRadius: '8px', padding: '1.5rem', background: '#fff', position: 'relative' }}>
          <span style={{ position: 'absolute', top: '-10px', right: '15px', background: '#0284c7', color: '#fff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px' }}>
            POPULAR
          </span>
          <h3>Monthly Unlimited</h3>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0.5rem 0' }}>₹999</p>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Unlimited live broadcasts, live instructor chat, and session archives.</p>
          <button 
            onClick={() => handleFakeRazorpay('Monthly Pass', 999)} 
            style={{ width: '100%', padding: '0.6rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Subscribe Now
          </button>
        </div>
      </div>
    </div>
  );
}