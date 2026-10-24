import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ padding: '4rem 2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Daily Yoga Practice Broadcast</h1>
      <p style={{ color: '#64748b', maxWidth: '600px', margin: '0 auto 2rem' }}>
        Live streaming sessions with certified instructors, real-time live Q&A, and coordinator-managed daily schedules.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link to="/explore" style={{ padding: '0.8rem 1.6rem', background: '#0284c7', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>
          Explore Live Classes →
        </Link>
        <Link to="/pricing" style={{ padding: '0.8rem 1.6rem', background: '#10b981', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>
          View Subscription Plans
        </Link>
      </div>
    </div>
  );
}