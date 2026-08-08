import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../api/api.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const token = localStorage.getItem('waypoint_token');
    if (token) {
      api.getMe()
        .then(res => {
          if (res.user) setUser(res.user);
          else localStorage.removeItem('waypoint_token');
        })
        .catch(err => {
          console.error('Failed to fetch user:', err);
          localStorage.removeItem('waypoint_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.login({ email, password });
      if (res.token) {
        localStorage.setItem('waypoint_token', res.token);
        setUser(res.user);
        return res.user;
      } else {
        throw new Error(res.error || 'Login failed');
      }
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const res = await api.register({ name, email, password, role });
      if (res.token) {
        localStorage.setItem('waypoint_token', res.token);
        setUser(res.user);
        return res.user;
      } else {
        throw new Error(res.error || 'Registration failed');
      }
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const loginWithGoogle = async (accessToken, role) => {
    try {
      const res = await api.googleAuth(accessToken, role);
      if (res.token) {
        localStorage.setItem('waypoint_token', res.token);
        setUser(res.user);
        return res.user;
      } else {
        throw new Error(res.error || 'Google login failed');
      }
    } catch (err) {
      toast.error(err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('waypoint_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
