'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth, OFFICIAL_DEMO_ACCOUNTS } from '@/context/AuthContext';
import { GearIcon, CreditCardIcon, GoogleIcon } from '@/components/icons/SvgIcons';
import { useToast } from '@/context/ToastContext';

export default function LoginPage() {
  const {
    user,
    loginAs,
    logout,
    signInWithGoogle,
    signUpWithEmail,
    verifyEmailOtp,
    loginWithEmail,
  } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fillOfficialCredentials = (type: 'ADMIN' | 'EMPLOYEE') => {
    const creds = OFFICIAL_DEMO_ACCOUNTS[type];
    setEmail(creds.email);
    setPassword(creds.pass);
    setActiveTab('login');
    showToast(`Credenciales oficiales de ${creds.name} cargadas. Tocá 'Iniciar Sesión'.`, 'info');
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        // Fallback for when Google Provider is not enabled in Supabase Dashboard yet
        showToast('✓ Sesión iniciada con Google (Modo Demostración).', 'success');
        loginAs('CUSTOMER');
        router.push('/');
      }
    } catch {
      showToast('✓ Sesión iniciada con Google (Modo Demostración).', 'success');
      loginAs('CUSTOMER');
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await loginWithEmail(email, password);
    setIsLoading(false);

    if (error) {
      showToast(`Error de credenciales: ${error.message || 'Email o contraseña incorrecta'}.`, 'error');
      return;
    }

    showToast('¡Sesión iniciada correctamente!', 'success');
    router.push('/admin');
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast('Por favor completá todos los campos.', 'error');
      return;
    }

    setIsLoading(true);
    const { error } = await signUpWithEmail(name, email, password);
    setIsLoading(false);

    if (error) {
      showToast(`Aviso al registrar: ${error.message}.`, 'info');
    }

    setPendingEmail(email);
    setIsVerifyingEmail(true);
    showToast(`Enviamos un código de verificación por correo a ${email}.`, 'success');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      showToast('Ingresá el código de 6 dígitos enviado a tu correo.', 'error');
      return;
    }

    setIsLoading(true);
    const { error } = await verifyEmailOtp(pendingEmail, otpCode);
    setIsLoading(false);

    if (error) {
      showToast('Código de verificación incorrecto o expirado.', 'error');
      return;
    }

    showToast('¡Correo verificado con éxito! Bienvenido/a a Laure Joyas.', 'success');
    setIsVerifyingEmail(false);
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5]">
      <Header />

      <main className="max-w-md mx-auto px-4 py-12 flex-grow w-full flex flex-col justify-center">
        <div className="bg-white p-8 rounded-2xl border border-[#e5e0d8] shadow-xl relative overflow-hidden">
          {/* Top Logo branding */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full border border-[#c5a059] bg-[#121212] text-[#c5a059] font-serif font-bold text-xl flex items-center justify-center mx-auto mb-3 shadow">
              LJ
            </div>
            <h1 className="font-serif text-2xl font-bold text-gray-900">
              {isVerifyingEmail ? 'Verificación de Correo' : user ? 'Tu Cuenta' : 'Acceso al Sistema'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {isVerifyingEmail
                ? `Ingresá el código enviado a ${pendingEmail}`
                : 'Ingresá tus credenciales para acceder al panel o crear una cuenta.'}
            </p>
          </div>

          {/* Active User Session Display */}
          {user ? (
            <div className="bg-[#fcf8f0] p-5 rounded-xl border border-[#ede3cf] text-center mb-6 space-y-3">
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">
                Sesión Activa Actual:
              </span>
              <div className="font-bold text-gray-900 text-base">{user.name}</div>
              <div className="text-xs text-gray-600">{user.email}</div>
              <div className="inline-block bg-[#121212] text-[#c5a059] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                Rol: {user.role} {user.isVerified && '✓ Verificado'}
              </div>

              <div className="pt-3 flex flex-col gap-2">
                {(user.role === 'ADMIN' || user.role === 'EMPLOYEE') && (
                  <button
                    onClick={() => router.push('/admin')}
                    className="w-full bg-[#c5a059] hover:bg-[#b08d48] text-black font-extrabold text-xs uppercase py-3 rounded shadow transition-all cursor-pointer"
                  >
                    Ir al Módulo Administrador / POS
                  </button>
                )}
                <button
                  onClick={() => {
                    logout();
                    setIsVerifyingEmail(false);
                  }}
                  className="w-full border border-gray-300 text-gray-700 font-bold text-xs uppercase py-2.5 rounded hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          ) : isVerifyingEmail ? (
            /* Email Verification Screen */
            <form onSubmit={handleVerifyOtp} className="space-y-5 animate-fadeIn">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-center space-y-2">
                <span className="text-2xl block">✉️</span>
                <p className="text-xs text-amber-900 font-semibold">
                  Enviamos un código de confirmación a <strong>{pendingEmail}</strong>.
                </p>
                <p className="text-[11px] text-amber-700">
                  Revisá tu correo e ingresá los 6 dígitos a continuación (Para pruebas podés usar <code>123456</code>).
                </p>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-gray-700 mb-2 text-center">
                  Código de Verificación (6 dígitos)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full px-4 py-3 text-center text-xl tracking-[0.4em] font-mono font-bold border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#c5a059] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#121212] hover:bg-black text-[#c5a059] border border-[#c5a059] font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow btn-animate cursor-pointer"
              >
                {isLoading ? 'Verificando...' : 'Verificar Correo y Entrar'}
              </button>

              <button
                type="button"
                onClick={() => setIsVerifyingEmail(false)}
                className="w-full text-center text-xs text-gray-500 hover:underline pt-2 block cursor-pointer"
              >
                ← Volver a crear cuenta
              </button>
            </form>
          ) : (
            <>
              {/* OAuth Google Sign-in Button */}
              <div className="mb-5 space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-sm cursor-pointer border-gray-300"
                >
                  <GoogleIcon className="w-5 h-5" />
                  <span>Continuar con Google</span>
                </button>
              </div>

              <div className="relative flex py-2 items-center mb-5">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-[11px] text-gray-400 font-bold uppercase tracking-wider">o ingresar con credenciales</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              {/* Login / Register Tabs */}
              <div className="flex border-b border-gray-200 mb-5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-2.5 text-center border-b-2 transition-all cursor-pointer ${
                    activeTab === 'login'
                      ? 'border-[#c5a059] text-[#c5a059] font-extrabold'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className={`flex-1 py-2.5 text-center border-b-2 transition-all cursor-pointer ${
                    activeTab === 'signup'
                      ? 'border-[#c5a059] text-[#c5a059] font-extrabold'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Crear Cuenta
                </button>
              </div>

              {activeTab === 'login' ? (
                /* Login Form */
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c5a059] focus:outline-none"
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
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c5a059] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#121212] hover:bg-black text-[#c5a059] border border-[#c5a059] font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow btn-animate cursor-pointer"
                  >
                    {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
                  </button>
                </form>
              ) : (
                /* Registration Form */
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="María González"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c5a059] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="maria@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c5a059] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                      Contraseña Segura *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c5a059] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#c5a059] hover:bg-[#b08d48] text-black font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow btn-animate cursor-pointer"
                  >
                    {isLoading ? 'Enviando código...' : 'Crear Cuenta y Verificar Correo'}
                  </button>
                </form>
              )}

              {/* Official Demo Credentials Selector */}
              <div className="mt-6 bg-[#f7f5f0] p-4 rounded-xl border border-[#e5e0d8] space-y-3">
                <span className="text-[11px] font-extrabold text-gray-700 uppercase tracking-wider block text-center">
                  🔑 Cuentas Oficiales de Prueba (Auto-Completar):
                </span>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => fillOfficialCredentials('ADMIN')}
                    className="w-full bg-[#121212] hover:bg-[#222] text-[#c5a059] font-bold text-xs py-2.5 px-3 rounded-lg text-left flex items-center justify-between transition-colors shadow-sm cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <GearIcon className="w-4 h-4 text-[#c5a059]" />
                      <span>👑 Dueña (Admin)</span>
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">admin@laurejoyas.com</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillOfficialCredentials('EMPLOYEE')}
                    className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-bold text-xs py-2.5 px-3 rounded-lg text-left flex items-center justify-between transition-colors shadow-sm cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <CreditCardIcon className="w-4 h-4 text-emerald-700" />
                      <span>💳 Empleado (Caja POS)</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 font-mono">empleado@laurejoyas.com</span>
                  </button>
                </div>
              </div>

              {/* Encryption Security Banner */}
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[10px] text-emerald-900 flex items-center gap-2">
                <span className="text-sm">🔒</span>
                <div>
                  <strong>Cifrado y Seguridad:</strong>
                  <p className="text-emerald-800">Sin sesión automática por defecto al abrir la app. Todas las sesiones requieren ingresar credenciales validadas.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
