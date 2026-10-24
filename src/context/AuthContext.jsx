import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (user) await refreshUserData(user.id);
      setLoading(false);
    });

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        await refreshUserData(currentUser.id);
      } else {
        setProfile(null);
        setSubscription(null);
      }
      setLoading(false);
    });

    return () => authSub.unsubscribe();
  }, []);

  async function refreshUserData(userId) {
    // 1. Fetch Profile
    const { data: prof } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
    setProfile(prof);

    // 2. Fetch Active Subscription
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('*, plans(*)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('end_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    setSubscription(sub);
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSubscription(null);
  }

  return (
    <AuthContext.Provider value={{ user, profile, subscription, loading, refreshUserData, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);