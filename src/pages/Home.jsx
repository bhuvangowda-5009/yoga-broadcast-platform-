import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, profile } = useAuth();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% -10%, #172554 0%, #090d16 55%, #030712 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#f8fafc',
      overflowX: 'hidden'
    }}>
      {/* HERO SECTION */}
      <section style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '5.5rem 2rem 4rem 2rem',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* TELEMETRY STATUS PILL */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '6px 16px',
          borderRadius: '24px',
          backdropFilter: 'blur(10px)',
          marginBottom: '2rem'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }}></span>
          <span style={{ fontSize: '0.78rem', fontWeight: '700', letterSpacing: '0.8px', color: '#cbd5e1' }}>
            SYNCHRONOUS TRANSMISSION SYSTEM ACTIVE
          </span>
        </div>

        {/* HERO TITLE */}
        <h1 style={{
          fontSize: 'clamp(2.5rem, 5.5vw, 4.4rem)',
          fontWeight: '900',
          letterSpacing: '-1.8px',
          lineHeight: 1.08,
          margin: '0 auto 1.5rem auto',
          maxWidth: '920px',
          background: 'linear-gradient(180deg, #ffffff 40%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Daily Live Yoga Broadcast Platform.
        </h1>

        {/* HERO SUBTEXT */}
        <p style={{
          fontSize: '1.15rem',
          lineHeight: 1.65,
          color: '#94a3b8',
          maxWidth: '720px',
          margin: '0 auto 2.8rem auto'
        }}>
          Practice with verified yoga masters daily. Join low-latency morning & evening broadcasts, receive automated WhatsApp & SMS alerts, and build consecutive streak habit telemetry.
        </p>

        {/* DUAL ACTION CTAS */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link
            to="/today"
            style={{
              padding: '1rem 2.2rem',
              borderRadius: '12px',
              background: '#0284c7',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: '800',
              fontSize: '1rem',
              boxShadow: '0 10px 30px -5px rgba(2, 132, 199, 0.5)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.15s ease'
            }}
          >
            <span>Open Today's Practice</span>
            <span style={{ fontSize: '1.2rem' }}>→</span>
          </Link>

          <Link
            to="/pricing"
            style={{
              padding: '1rem 2.2rem',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#f8fafc',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(10px)',
              transition: 'background 0.2s ease'
            }}
          >
            View Subscription Passes
          </Link>
        </div>

        {/* LIVE METRICS DOCK */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          maxWidth: '980px',
          margin: '5rem auto 0 auto'
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.55)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '16px',
            padding: '1.6rem',
            textAlign: 'left',
            backdropFilter: 'blur(12px)'
          }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#38bdf8', letterSpacing: '0.8px' }}>
              BROADCAST INFRASTRUCTURE
            </span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0.4rem 0 0.2rem 0', color: '#fff' }}>
              Permanent Studio
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              Instant WebRTC low-latency streaming without software downloads.
            </p>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.55)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '16px',
            padding: '1.6rem',
            textAlign: 'left',
            backdropFilter: 'blur(12px)'
          }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#34d399', letterSpacing: '0.8px' }}>
              HABIT ANALYTICS
            </span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0.4rem 0 0.2rem 0', color: '#fff' }}>
              Dynamic Streaks
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              Automated database attendance logging counting consecutive sessions.
            </p>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.55)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '16px',
            padding: '1.6rem',
            textAlign: 'left',
            backdropFilter: 'blur(12px)'
          }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#a855f7', letterSpacing: '0.8px' }}>
              NOTIFICATION ENGINE
            </span>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0.4rem 0 0.2rem 0', color: '#fff' }}>
              WhatsApp Web & API
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              Coordinator 30-minute reminder dispatch to practitioner numbers.
            </p>
          </div>
        </div>
      </section>

      {/* THREE-TIER ROLE ARCHITECTURE PREVIEW */}
      <section style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '4rem 2rem 6rem 2rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{
            fontSize: '0.74rem',
            fontWeight: '800',
            letterSpacing: '1px',
            color: '#38bdf8',
            background: 'rgba(56, 189, 248, 0.1)',
            padding: '4px 12px',
            borderRadius: '16px',
            border: '1px solid rgba(56, 189, 248, 0.2)'
          }}>
            ENTERPRISE RBAC GOVERNANCE
          </span>
          <h2 style={{ fontSize: '2.4rem', fontWeight: '800', letterSpacing: '-0.8px', margin: '0.8rem 0 0.4rem 0' }}>
            Built for Students, Faculty, and Operations.
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}>
            Every stakeholder accesses a dedicated, role-enforced workspace with automated admin vetting.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {/* CARD 1: SUBSCRIBER */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '2.4rem',
            backdropFilter: 'blur(16px)'
          }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '1.2rem' }}>
              🧘
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '800', margin: '0 0 0.6rem 0' }}>Subscriber Portal</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
              Instant user registration, active subscription verification via Razorpay, posture Q&A live chat, and profile phone editing.
            </p>
            <Link to="/today" style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: '800', textDecoration: 'none' }}>
              Enter Daily Live Session →
            </Link>
          </div>

          {/* CARD 2: INSTRUCTOR */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '20px',
            padding: '2.4rem',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 0 35px -10px rgba(16, 185, 129, 0.15)'
          }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '1.2rem' }}>
              📹
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '800', margin: '0 0 0.6rem 0' }}>Instructor Studio</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
              Requires Admin vetting. Instructors launch permanent camera/mic broadcast windows, configure difficulty levels, and host live flows.
            </p>
            <Link to="/instructor" style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: '800', textDecoration: 'none' }}>
              Launch Instructor Studio →
            </Link>
          </div>

          {/* CARD 3: COORDINATOR & ADMIN */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            borderRadius: '20px',
            padding: '2.4rem',
            backdropFilter: 'blur(16px)'
          }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '1.2rem' }}>
              📋
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '800', margin: '0 0 0.6rem 0' }}>Coordinator & HQ</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
              Coordinate schedules, dispatch WhatsApp 30-min reminders, approve incoming staff candidates, and oversee user permissions.
            </p>
            <Link to="/coordinator" style={{ color: '#c084fc', fontSize: '0.85rem', fontWeight: '800', textDecoration: 'none' }}>
              Open Coordinator Desk →
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        color: '#64748b',
        fontSize: '0.85rem'
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            © 2026 YogaLive Platform • Engineered with React, Supabase & WebRTC
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/today" style={{ color: '#94a3b8', textDecoration: 'none' }}>Live Studio</Link>
            <Link to="/pricing" style={{ color: '#94a3b8', textDecoration: 'none' }}>Passes</Link>
            <Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none' }}>Staff Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}