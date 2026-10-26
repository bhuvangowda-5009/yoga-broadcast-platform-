import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [loading, setLoading] = useState(true);

  async function refreshUserData(userId) {
    if (!userId) {
      setUser(null);
      setProfile(null);
      setSubscription(null);
      setIsDemoActive(false);
      setLoading(false);
      return;
    }

    try {
      // 1. Load User Profile
      const { data: prof } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      setProfile(prof || null);

      // 2. Load Subscription (Must be active and unexpired)
      const nowIso = new Date().toISOString();
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gte('end_date', nowIso)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      setSubscription(sub || null);

      // 3. Calculate Day 1 Free Demo (Valid strictly for the first 24 hours of account creation)
      if (prof?.created_at) {
        const createdMs = new Date(prof.created_at).getTime();
        const currentMs = Date.now();
        const elapsedHours = (currentMs - createdMs) / (1000 * 60 * 60);
        setIsDemoActive(elapsedHours <= 24);
      } else {
        setIsDemoActive(false);
      }
    } catch (err) {
      console.error('Error refreshing auth data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        refreshUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await refreshUserData(currentUser.id);
        } else {
          setProfile(null);
          setSubscription(null);
          setIsDemoActive(false);
          setLoading(false);
        }
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setUser(null);
      setProfile(null);
      setSubscription(null);
      setIsDemoActive(false);
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('SignOut warning:', err.message);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        subscription,
        isDemoActive,
        loading,
        refreshUserData,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);