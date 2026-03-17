import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';
import type { AuthEmployee } from '../types';

interface AuthContextType {
  user: AuthEmployee | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isManager: boolean;
  isStaff: boolean;
  canManage: boolean; // admin or manager
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthEmployee | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { token: t, employee } = await authApi.login(email, password);
      setToken(t);
      setUser(employee);
      localStorage.setItem('token', t);
      localStorage.setItem('user', JSON.stringify(employee));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const isAdmin   = user?.role === 'ADMIN';
  const isManager = user?.role === 'MANAGER';
  const isStaff   = user?.role === 'STAFF';
  const canManage = isAdmin || isManager;

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, isAdmin, isManager, isStaff, canManage }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
