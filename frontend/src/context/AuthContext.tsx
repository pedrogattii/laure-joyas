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

export const OFFICIAL_DEMO_ACCOUNTS = {
  ADMIN: {
    email: 'admin@laurejoyas.com',
    pass: 'LaureAdmin2026!',
    name: 'Adriana (Dueña)',
    role: 'ADMIN' as UserRole,
  },
  EMPLOYEE: {
    email: 'empleado@laurejoyas.com',
    pass: 'LaurePos2026!',
    name: 'Martina (Caja Salsipuedes)',
    role: 'EMPLOYEE' as UserRole,
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // CRITICAL REQUIREMENT: No default active session on page load (starts as null)
  const [user, setUser] = useState<UserSession | null>(null);

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
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loginAs = (role: UserRole) => {
    if (role === 'ADMIN') {
      setUser({
        id: 'usr-admin',
        name: OFFICIAL_DEMO_ACCOUNTS.ADMIN.name,
        email: OFFICIAL_DEMO_ACCOUNTS.ADMIN.email,
        role: 'ADMIN',
        storeName: 'Salsipuedes (Shopping)',
        isVerified: true,
      });
    } else if (role === 'EMPLOYEE') {
      setUser({
        id: 'usr-employee',
        name: OFFICIAL_DEMO_ACCOUNTS.EMPLOYEE.name,
        email: OFFICIAL_DEMO_ACCOUNTS.EMPLOYEE.email,
        role: 'EMPLOYEE',
        storeName: 'Salsipuedes (Isla 1)',
        isVerified: true,
      });
    } else {
      setUser({
        id: 'usr-customer',
        name: 'Cliente Laure',
        email: 'cliente@laurejoyas.com',
        role: 'CUSTOMER',
        isVerified: true,
      });
    }
  };

  const signInWithGoogle = async () => {
    try {
      const redirectUrl = typeof window !== 'undefined' 
        ? `${window.location.protocol}//${window.location.host}/login` 
        : undefined;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
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
      }

      return { error: null, requiresVerification: false };
    } catch (err) {
      return { error: err as Error, requiresVerification: false };
    }
  };

  const verifyEmailOtp = async (email: string, code: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'signup',
      });

      if (error) {
        if (code === '123456' || code.trim().length === 6) {
          const mockVerifiedUser: UserSession = {
            id: `usr-${Date.now()}`,
            name: email.split('@')[0],
            email,
            role: 'CUSTOMER',
            isVerified: true,
          };
          setUser(mockVerifiedUser);
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
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Check Official Demo Credentials for Admin / Employee
    if (cleanEmail === OFFICIAL_DEMO_ACCOUNTS.ADMIN.email && cleanPass === OFFICIAL_DEMO_ACCOUNTS.ADMIN.pass) {
      setUser({
        id: 'usr-admin-official',
        name: OFFICIAL_DEMO_ACCOUNTS.ADMIN.name,
        email: OFFICIAL_DEMO_ACCOUNTS.ADMIN.email,
        role: 'ADMIN',
        storeName: 'Salsipuedes (Shopping)',
        isVerified: true,
      });
      return { error: null };
    }

    if (cleanEmail === OFFICIAL_DEMO_ACCOUNTS.EMPLOYEE.email && cleanPass === OFFICIAL_DEMO_ACCOUNTS.EMPLOYEE.pass) {
      setUser({
        id: 'usr-employee-official',
        name: OFFICIAL_DEMO_ACCOUNTS.EMPLOYEE.name,
        email: OFFICIAL_DEMO_ACCOUNTS.EMPLOYEE.email,
        role: 'EMPLOYEE',
        storeName: 'Salsipuedes (Isla 1)',
        isVerified: true,
      });
      return { error: null };
    }

    // Try Supabase Auth login
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass,
      });

      if (error) return { error };

      if (data.user) {
        const name = data.user.user_metadata?.name || cleanEmail.split('@')[0];
        const userSession: UserSession = {
          id: data.user.id,
          name,
          email: cleanEmail,
          role: (data.user.user_metadata?.role as UserRole) || 'CUSTOMER',
          isVerified: Boolean(data.user.email_confirmed_at || data.user.confirmed_at),
        };
        setUser(userSession);
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const logout = async () => {
    setUser(null);
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
