import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  email: string;
  companyName: string;
  is_admin?: boolean;  // ← ajouté
}

interface Subscription {
  plan_name: string;
  display_name: string;
  expires_at: string;
  expires_soon?: boolean;
  days_remaining?: number;
}

interface AuthContextType {
  user: User | null;
  subscription: Subscription | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  checkSubscription: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      refreshUser();
    }
  }, []);

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      setSubscription(data.subscription);
    } catch {
      localStorage.removeItem('token');
      setUser(null);
      setSubscription(null);
    }
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    setSubscription(data.subscription);
  };

  const register = async (userData: any) => {
    const { data } = await api.post('/auth/register', userData);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    setSubscription(data.subscription);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setSubscription(null);
  };

  const checkSubscription = async () => {
    if (user) {
      const { data } = await api.get('/subscriptions/current');
      setSubscription(data);
    }
  };

  return (
    <AuthContext.Provider value={{ user, subscription, login, register, logout, checkSubscription, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
