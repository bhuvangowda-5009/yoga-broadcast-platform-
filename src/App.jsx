import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Login from './pages/Login';
import Coordinator from './pages/Coordinator';
import Admin from './pages/Admin';
import Pricing from './pages/Pricing';

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) fetchUserProfile(user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        fetchUserProfile(currentUser.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUserProfile(userId) {
    const { data } = await supabase.from('yoga_profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  return (
    <BrowserRouter>
      <Navbar user={user} profile={profile} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore user={user} />} />
        <Route path="/pricing" element={<Pricing user={user} />} />
        <Route path="/login" element={<Login user={user} />} />
        <Route path="/coordinator" element={<Coordinator profile={profile} />} />
        <Route path="/admin" element={<Admin profile={profile} />} />
      </Routes>
    </BrowserRouter>
  );
}