'use client';

import React, { createContext, useContext, useState } from 'react';

export type UserRole = 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeName?: string;
}

interface AuthContextType {
  user: UserSession | null;
  loginAs: (role: UserRole) => void;
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
  },
  EMPLOYEE: {
    id: 'usr-employee',
    name: 'Martina (Caja Salsipuedes)',
    email: 'martina@laurejoyas.com.ar',
    role: 'EMPLOYEE',
    storeName: 'Salsipuedes (Isla 1)',
  },
  CUSTOMER: {
    id: 'usr-customer',
    name: 'María González',
    email: 'maria@gmail.com',
    role: 'CUSTOMER',
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
        console.error(e);
      }
    }
    return null;
  });

  const loginAs = (role: UserRole) => {
    const session = DEFAULT_USERS[role];
    setUser(session);
    localStorage.setItem('lj_auth_session', JSON.stringify(session));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lj_auth_session');
  };

  const isAdmin = user?.role === 'ADMIN';
  const isEmployee = user?.role === 'EMPLOYEE' || user?.role === 'ADMIN';
  const isCustomer = user?.role === 'CUSTOMER';

  return (
    <AuthContext.Provider
      value={{
        user,
        loginAs,
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
