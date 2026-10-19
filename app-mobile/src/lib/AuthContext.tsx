import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, setToken, clearToken } from './api';
import { setHasCompletedOnboarding } from './onboardingStorage';

interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshUser();
  }, []);

  async function refreshUser() {
    try {
      const me = await api.me();
      setUser(me);
      if (me) {
        setHasCompletedOnboarding(true);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const { access_token } = await api.login(email, password);
    await setToken(access_token);
    await setHasCompletedOnboarding(true);
    await refreshUser();
  }

  async function signup(email: string, password: string) {
    const { access_token } = await api.signup(email, password);
    await setToken(access_token);
    await setHasCompletedOnboarding(true);
    await refreshUser();
  }

  async function logout() {
    await clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
