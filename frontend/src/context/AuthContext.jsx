import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (API.getToken()) {
          const res = await API.get('/auth/me');
          setUser(res.user);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        API.setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Listen for unauthorized events to auto-logout
    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (identifier, password) => {
    try {
      const res = await API.post('/auth/login', { identifier, password });
      API.setToken(res.token);
      setUser(res.user);
      return res;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const res = await API.post('/auth/signup', userData);
      API.setToken(res.token);
      setUser(res.user);
      return res;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    API.setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
