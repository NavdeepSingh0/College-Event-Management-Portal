import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    if (token) {
      // In a real app, verify token or decode it. For now, mock a user
      setUser({ role: localStorage.getItem('userRole') || 'student' });
    }
  }, [token]);

  const login = (newToken, role) => {
    setToken(newToken);
    setUser({ role });
    localStorage.setItem('token', newToken);
    localStorage.setItem('userRole', role);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
