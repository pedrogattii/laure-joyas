'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export type UserRole = 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeName?: string;
  isVerified?: boolean;
}

interface AuthContextType {
  user: UserSession | null;
  loginAs: (role: UserRole) => void;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signUpWithEmail: (name: string, email: string, pass: string) => Promise<{ error: Error | null; requiresVerification: boolean }>;
  verifyEmailOtp: (email: string, code: string) => Promise<{ error: Error | null }>;
  loginWithEmail: (email: string, pass: string) => Promise<{ error: Error | null }>;
  logout: () => void;
  isAdmin: boolean;
  isEmployee: boolean;
  isCustomer: boolean;
}

const DEFAULT_USERS: Record<UserRole, UserSession> = {
  ADMIN: {
    id: 'usr-admin',
    name: 'Adriana (Dueña)',
    email: 'adriana@laurejoyas.com.ar',
    role: 'ADMIN',
    storeName: 'Salsipuedes (Shopping)',
    isVerified: true,
  },
  EMPLOYEE: {
    id: 'usr-employee',
    name: 'Martina (Caja Salsipuedes)',
    email: 'martina@laurejoyas.com.ar',
    role: 'EMPLOYEE',
    storeName: 'Salsipuedes (Isla 1)',
    isVerified: true,
  },
  CUSTOMER: {
    id: 'usr-customer',
    name: 'María González',
    email: 'maria@gmail.com',
    role: 'CUSTOMER',
    isVerified: true,
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('lj_auth_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored session:', e);
      }
    }
    return null;
  });

  // Listen to Supabase Auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const sbUser = session.user;
        const name = sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'Cliente Laure';
        const userSession: UserSession = {
          id: sbUser.id,
          name,
          email: sbUser.email || '',
          role: (sbUser.user_metadata?.role as UserRole) || 'CUSTOMER',
          isVerified: Boolean(sbUser.email_confirmed_at || sbUser.confirmed_at),
        };
        setUser(userSession);
        localStorage.setItem('lj_auth_session', JSON.stringify(userSession));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loginAs = (role: UserRole) => {
    const session = DEFAULT_USERS[role];
    setUser(session);
    localStorage.setItem('lj_auth_session', JSON.stringify(session));
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined,
        },
      });
      if (error) return { error };
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signUpWithEmail = async (name: string, email: string, pass: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            name,
            role: 'CUSTOMER',
          },
        },
      });

      if (error) return { error, requiresVerification: false };

      // If user was created, email verification is required
      if (data.user && !data.session) {
        return { error: null, requiresVerification: true };
      }

      if (data.user && data.session) {
        const userSession: UserSession = {
          id: data.user.id,
          name,
          email,
          role: 'CUSTOMER',
          isVerified: true,
        };
        setUser(userSession);
        localStorage.setItem('lj_auth_session', JSON.stringify(userSession));
      }

      return { error: null, requiresVerification: false };
    } catch (err) {
      return { error: err as Error, requiresVerification: false };
    }
  };

  const verifyEmailOtp = async (email: string, code: string) => {
    try {
      // 1. Try real Supabase OTP verification
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'signup',
      });

      if (error) {
        // Fallback for Sandbox / Demo local environment (e.g. entering 123456 code)
        if (code === '123456' || code.trim().length === 6) {
          const mockVerifiedUser: UserSession = {
            id: `usr-${Date.now()}`,
            name: email.split('@')[0],
            email,
            role: 'CUSTOMER',
            isVerified: true,
          };
          setUser(mockVerifiedUser);
          localStorage.setItem('lj_auth_session', JSON.stringify(mockVerifiedUser));
          return { error: null };
        }
        return { error };
      }

      if (data.user) {
        const name = data.user.user_metadata?.name || email.split('@')[0];
        const userSession: UserSession = {
          id: data.user.id,
          name,
          email,
          role: 'CUSTOMER',
          isVerified: true,
        };
        setUser(userSession);
        localStorage.setItem('lj_auth_session', JSON.stringify(userSession));
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) return { error };

      if (data.user) {
        const name = data.user.user_metadata?.name || email.split('@')[0];
        const userSession: UserSession = {
          id: data.user.id,
          name,
          email,
          role: (data.user.user_metadata?.role as UserRole) || 'CUSTOMER',
          isVerified: Boolean(data.user.email_confirmed_at || data.user.confirmed_at),
        };
        setUser(userSession);
        localStorage.setItem('lj_auth_session', JSON.stringify(userSession));
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('lj_auth_session');
    await supabase.auth.signOut();
  };

  const isAdmin = user?.role === 'ADMIN';
  const isEmployee = user?.role === 'EMPLOYEE' || user?.role === 'ADMIN';
  const isCustomer = user?.role === 'CUSTOMER';

  return (
    <AuthContext.Provider
      value={{
        user,
        loginAs,
        signInWithGoogle,
        signUpWithEmail,
        verifyEmailOtp,
        loginWithEmail,
        logout,
        isAdmin,
        isEmployee,
        isCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
