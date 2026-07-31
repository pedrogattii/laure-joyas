'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth, UserRole } from '@/context/AuthContext';

export default function LoginPage() {
  const { user, loginAs, logout } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleQuickLogin = (role: UserRole) => {
    loginAs(role);
    if (role === 'ADMIN' || role === 'EMPLOYEE') {
      router.push('/admin');
    } else {
      router.push('/');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default to admin or employee for demo
    loginAs('ADMIN');
    router.push('/admin');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5]">
      <Header />

      <main className="max-w-md mx-auto px-4 py-16 flex-grow w-full flex flex-col justify-center">
        <div className="bg-white p-8 rounded-xl border border-[#e5e0d8] shadow-lg relative">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full border border-[#c5a059] bg-[#121212] text-[#c5a059] font-serif font-bold text-xl flex items-center justify-center mx-auto mb-3">
              LJ
            </div>
            <h1 className="font-serif text-2xl font-bold text-gray-900">
              Acceso al Sistema
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Ingresá con tus credenciales según tu rol en Laure Joyas.
            </p>
          </div>

          {user ? (
            <div className="bg-[#fcf8f0] p-4 rounded-lg border border-[#ede3cf] text-center mb-6 space-y-3">
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">
                Sesión Activa Actual:
              </span>
              <div className="font-bold text-gray-900 text-sm">{user.name}</div>
              <div className="inline-block bg-[#121212] text-[#c5a059] text-[10px] font-bold px-2 py-0.5 rounded">
                Rol: {user.role}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                {(user.role === 'ADMIN' || user.role === 'EMPLOYEE') && (
                  <button
                    onClick={() => router.push('/admin')}
                    className="w-full bg-[#c5a059] text-black font-bold text-xs uppercase py-2.5 rounded"
                  >
                    Ir al Módulo Administrador / Caja
                  </button>
                )}
                <button
                  onClick={logout}
                  className="w-full border border-gray-300 text-gray-700 font-semibold text-xs uppercase py-2 rounded hover:bg-gray-50"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Quick Login Profile Selector for Demo */}
              <div className="mb-6 bg-[#f7f5f0] p-4 rounded-lg border border-[#e5e0d8] space-y-3">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider block text-center">
                  ⚡ Ingreso Rápido de Prueba (1-Clic):
                </span>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('ADMIN')}
                    className="w-full bg-[#121212] hover:bg-[#222] text-[#c5a059] font-bold text-xs py-2.5 px-3 rounded text-left flex items-center justify-between transition-colors shadow-sm"
                  >
                    <span>👑 Dueña (Administrador Total)</span>
                    <span className="text-[10px] text-gray-400">Dashboard + Stock</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('EMPLOYEE')}
                    className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-bold text-xs py-2.5 px-3 rounded text-left flex items-center justify-between transition-colors shadow-sm"
                  >
                    <span>🏪 Empleado (Caja Salsipuedes)</span>
                    <span className="text-[10px] text-emerald-700">Caja Rápida POS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('CUSTOMER')}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs py-2 px-3 rounded text-left flex items-center justify-between transition-colors"
                  >
                    <span>👤 Cliente Web</span>
                    <span className="text-[10px] text-gray-500">Navegación</span>
                  </button>
                </div>
              </div>

              <div className="relative flex py-2 items-center mb-6">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-xs text-gray-400 font-medium">o ingresá manualmente</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              {/* Standard Form */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="usuario@laurejoyas.com.ar"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#c5a059] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#c5a059] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#c5a059] hover:bg-[#a8843e] text-black font-bold text-xs uppercase tracking-wider py-3 rounded shadow"
                >
                  Iniciar Sesión
                </button>
              </form>
            </>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <p className="text-[11px] text-gray-500 leading-relaxed">
              💡 <em>Los clientes pueden navegar libremente por el catálogo sin necesidad de iniciar sesión.</em>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
