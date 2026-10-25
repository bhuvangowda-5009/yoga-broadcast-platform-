import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [desiredRole, setDesiredRole] = useState('subscriber');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      if (desiredRole === 'admin') {
        throw new Error('Admin registration is strictly prohibited.');
      }

      const isStaffApplication = desiredRole === 'instructor' || desiredRole === 'coordinator';
      const actualRole = 'subscriber';
      const isApproved = !isStaffApplication;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            role: actualRole,
            applied_role: isStaffApplication ? desiredRole : null,
            is_approved: isApproved
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        await supabase.from('users').upsert({
          id: data.user.id,
          name,
          email,
          phone,
          role: actualRole,
          applied_role: isStaffApplication ? desiredRole : null,
          is_approved: isApproved,
          verified: true
        });
      }

      if (isStaffApplication) {
        await supabase.auth.signOut();
        setMsg(`📋 Candidate Application Filed: Your submission for "${desiredRole.toUpperCase()}" is logged in Supabase. The Chief Admin must grant review approval before studio access is unlocked.`);
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
        return;
      }

      setMsg('🎉 Profile Initialized! Routing to login portal...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setMsg(`Onboarding Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 20% 80%, #064e3b 0%, #090d16 60%, #030712 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#f8fafc'
    }}>
      <div style={{
        maxWidth: '520px',
        width: '100%',
        borderRadius: '24px',
        overflow: 'hidden',
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px -10px rgba(16, 185, 129, 0.2)',
        padding: '3rem 2.8rem'
      }}>
        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '900',
            fontSize: '1.3rem',
            color: '#fff',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)',
            marginBottom: '1rem'
          }}>
            ॐ
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.5px', margin: '0 0 0.5rem 0' }}>
            Initialize Membership
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
            Join as a dedicated practitioner or apply for live broadcast staff roles.
          </p>
        </div>

        {msg && (
          <div style={{
            background: msg.includes('Application') ? 'rgba(245, 158, 11, 0.12)' : msg.includes('Initialized') ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: msg.includes('Application') ? '1px solid rgba(245, 158, 11, 0.3)' : msg.includes('Initialized') ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
            color: msg.includes('Application') ? '#fbbf24' : msg.includes('Initialized') ? '#34d399' : '#f87171',
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            fontSize: '0.84rem',
            lineHeight: 1.5,
            marginBottom: '1.5rem'
          }}>
            {msg}
          </div>
        )}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '6px' }}>
              PRACTITIONER / INSTRUCTOR NAME
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Bhuvan Gowda"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                padding: '0.8rem 1rem',
                fontSize: '0.9rem',
                color: '#fff',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '6px' }}>
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  padding: '0.8rem 1rem',
                  fontSize: '0.9rem',
                  color: '#fff',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '6px' }}>
                WHATSAPP / ALERTS
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  padding: '0.8rem 1rem',
                  fontSize: '0.9rem',
                  color: '#fff',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '6px' }}>
              ACCOUNT TYPE & ROLE INTENT
            </label>
            <select
              value={desiredRole}
              onChange={(e) => setDesiredRole(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                padding: '0.8rem 1rem',
                fontSize: '0.9rem',
                color: '#fff',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="subscriber">Subscriber Pass (Direct Student Access)</option>
              <option value="instructor">Instructor Studio (Subject to Admin Review)</option>
              <option value="coordinator">Session Coordinator (Subject to Admin Review)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '6px' }}>
              CREATE MASTER KEY (PASSWORD)
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '10px',
                padding: '0.8rem 1rem',
                fontSize: '0.9rem',
                color: '#fff',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.9rem',
              borderRadius: '10px',
              border: 'none',
              background: desiredRole === 'subscriber' ? '#10b981' : '#06b6d4',
              color: '#0f172a',
              fontWeight: '800',
              fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: desiredRole === 'subscriber' ? '0 8px 25px -4px rgba(16, 185, 129, 0.35)' : '0 8px 25px -4px rgba(6, 182, 212, 0.35)',
              marginTop: '0.8rem',
              transition: 'transform 0.15s ease'
            }}
          >
            {loading ? 'Filing Application...' : desiredRole === 'subscriber' ? 'Complete Subscriber Registration' : 'Submit Staff Application for Review'}
          </button>
        </form>

        <p style={{ fontSize: '0.82rem', color: '#64748b', textAlign: 'center', marginTop: '1.8rem', marginBottom: 0 }}>
          Already have verified credentials?{' '}
          <Link to="/login" style={{ color: '#38bdf8', fontWeight: '700', textDecoration: 'none' }}>
            Open Portal
          </Link>
        </p>
      </div>
    </div>
  );
}