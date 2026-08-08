import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import LandingPage from './components/LandingPage.jsx';
import RoleSelection from './components/RoleSelection.jsx';
import SignIn from './components/Auth/SignIn.jsx';
import Register from './components/Auth/Register.jsx';
import EducatorDashboard from './components/EducatorDashboard.jsx';
import CourseJoin from './components/CourseJoin.jsx';
import CourseMap from './components/CourseMap.jsx';

import { GoogleOAuthProvider } from '@react-oauth/google';

function ProtectedRoute({ allowedRole }) {
  const { user, loading } = useAuth();
  if (loading) return null; // Wait for initial auth check
  if (!user) return <Navigate to="/join" replace />;
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'educator' ? '/dashboard' : '/student/join'} replace />;
  }
  return <Outlet />;
}

export default function App() {
  React.useEffect(() => {
    document.title = 'Nodemap';
  }, []);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BrowserRouter basename="/concept-dependency-map">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/join" element={<RoleSelection />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute allowedRole="educator" />}>
              <Route path="/dashboard" element={<EducatorDashboard />} />
              <Route path="/course/:id/edit" element={<div className="app-shell"><CourseMap /></div>} />
            </Route>

            <Route element={<ProtectedRoute allowedRole="student" />}>
              <Route path="/student/join" element={<CourseJoin />} />
              <Route path="/course/:id" element={<div className="app-shell"><CourseMap /></div>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
