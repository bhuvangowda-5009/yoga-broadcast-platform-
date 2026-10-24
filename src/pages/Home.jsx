import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ padding: '5rem 2rem', textAlign: 'center', fontFamily: 'sans-serif', maxWidth: '850px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>Daily Live Yoga Broadcast Platform</h1>
      <p style={{ fontSize: '1.2rem', color: '#64748b', marginBottom: '2.5rem' }}>
        Practice with certified yoga masters daily. Access synchronous morning & evening streams, receive WhatsApp & SMS class alerts, and track your attendance streak.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link to="/today" style={{ padding: '0.9rem 1.8rem', background: '#0284c7', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>
          Open Today's Practice →
        </Link>
        <Link to="/pricing" style={{ padding: '0.9rem 1.8rem', background: '#10b981', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>
          View Subscription Plans
        </Link>
      </div>
    </div>
  );
}