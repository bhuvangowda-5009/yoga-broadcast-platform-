import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Components
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Today from './pages/Today';
import Library from './pages/Library';
import Pricing from './pages/Pricing';
import Profile from './pages/Profile';
import Instructor from './pages/Instructor';
import Coordinator from './pages/Coordinator';
import Admin from './pages/Admin';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/library" element={<Library />} />
          <Route path="/pricing" element={<Pricing />} />

          {/* Subscriber & Paid Route */}
          <Route path="/today" element={<Today />} />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute allowedRoles={['subscriber', 'instructor', 'coordinator', 'admin']}>
                <Profile />
              </ProtectedRoute>
            } 
          />

          {/* Instructor Studio */}
          <Route 
            path="/instructor" 
            element={
              <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                <Instructor />
              </ProtectedRoute>
            } 
          />

          {/* Coordinator Portal */}
          <Route 
            path="/coordinator" 
            element={
              <ProtectedRoute allowedRoles={['coordinator', 'admin']}>
                <Coordinator />
              </ProtectedRoute>
            } 
          />

          {/* Admin Control */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Admin />
              </ProtectedRoute>
            } 
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}