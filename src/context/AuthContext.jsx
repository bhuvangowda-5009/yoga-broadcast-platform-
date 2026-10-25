import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshUserData(userId) {
    if (!userId) {
      setUser(null);
      setProfile(null);
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      const { data: prof } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      setProfile(prof || null);

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();
      setSubscription(sub || null);
    } catch (err) {
      console.error('Error refreshing user state:', err);
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
          setLoading(false);
        }
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  // Resilient logout that clears React state even if server socket delays
  const signOut = async () => {
    try {
      setUser(null);
      setProfile(null);
      setSubscription(null);
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('SignOut network fallback:', err.message);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, subscription, loading, refreshUserData, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);