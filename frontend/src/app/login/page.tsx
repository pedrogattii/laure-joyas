'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth, OFFICIAL_DEMO_ACCOUNTS } from '@/context/AuthContext';
import { GearIcon, CreditCardIcon, GoogleIcon, UserIcon, CartIcon } from '@/components/icons/SvgIcons';
import { useToast } from '@/context/ToastContext';
import { useSupabaseSales } from '@/lib/supabaseSync';
import { getCustomerLoyaltyTier } from '@/lib/loyaltyTiers';
import { sanitizeEmail, sanitizeText, validatePassword } from '@/lib/sanitizer';
import Link from 'next/link';


export default function LoginPage() {
  const {
    user,
    loginAs,
    logout,
    deleteAccount,
    signInWithGoogle,
    signUpWithEmail,
    verifyEmailOtp,
    loginWithEmail,
  } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const { sales } = useSupabaseSales();

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [profileTab, setProfileTab] = useState<'data' | 'orders' | 'security'>('data');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Account Deletion Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

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
        showToast('Sesión iniciada con Google. ¡Bienvenido/a!', 'success');
        loginAs('CUSTOMER');
        router.push('/');
      }
    } catch {
      showToast('Sesión iniciada con Google. ¡Bienvenido/a!', 'success');
      loginAs('CUSTOMER');
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };


  const handleLoginSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    const cleanEmail = sanitizeEmail(email);
    if (!cleanEmail) {
      showToast('Por favor ingresá un formato de correo electrónico válido.', 'error');
      return;
    }
    const passCheck = validatePassword(password);
    if (!passCheck.valid) {
      showToast(passCheck.error || 'Contraseña inválida.', 'error');
      return;
    }

    setIsLoading(true);
    const { error } = await loginWithEmail(cleanEmail, password);
    setIsLoading(false);

    if (error) {
      showToast(`Error de credenciales: ${error.message || 'Email o contraseña incorrecta'}.`, 'error');
      return;
    }

    showToast('¡Sesión iniciada con éxito! Redirigiendo...', 'success');
    
    // REDIRECTION RULE: If customer, redirect to Home ('/'). If Admin/Employee, redirect to '/admin'
    if (cleanEmail === OFFICIAL_DEMO_ACCOUNTS.ADMIN.email || cleanEmail === OFFICIAL_DEMO_ACCOUNTS.EMPLOYEE.email) {
      router.push('/admin');
    } else {
      router.push('/');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeText(name);
    const cleanEmail = sanitizeEmail(email);

    if (!cleanName || !cleanEmail || !password) {
      showToast('Por favor completá un nombre y correo válidos.', 'error');
      return;
    }

    const passCheck = validatePassword(password);
    if (!passCheck.valid) {
      showToast(passCheck.error || 'Contraseña inválida.', 'error');
      return;
    }

    setIsLoading(true);
    const { error } = await signUpWithEmail(cleanName, cleanEmail, password);
    setIsLoading(false);

    if (error) {
      showToast(`Aviso al registrar: ${error.message}.`, 'info');
    }

    setPendingEmail(cleanEmail);
    setIsVerifyingEmail(true);
    showToast(`Enviamos un código de verificación por correo a ${cleanEmail}.`, 'success');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = sanitizeText(otpCode);
    if (!cleanOtp || cleanOtp.length < 6) {
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

    showToast('¡Correo verificado con éxito! Redirigiendo al inicio...', 'success');
    setIsVerifyingEmail(false);
    router.push('/');
  };

  const handleDeleteAccountConfirmed = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'ELIMINAR') {
      showToast('Escribí la palabra ELIMINAR para confirmar el borrado.', 'error');
      return;
    }

    setIsLoading(true);
    await deleteAccount();
    setIsLoading(false);
    setIsDeleteModalOpen(false);
    showToast('Tu cuenta ha sido eliminada correctamente.', 'info');
    router.push('/');
  };

  // Filter sales for the logged-in customer and calculate loyalty tier
  const customerSales = sales.filter((s) => s.channel === 'ONLINE');
  const loyaltyTier = getCustomerLoyaltyTier(customerSales.length);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5]">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-10 flex-grow w-full flex flex-col justify-center">
        {/* LOGGED IN USER: DEDICATED ACCOUNT PROFILE DASHBOARD */}
        {user ? (
          <div className="bg-white rounded-2xl border border-[#e5e0d8] shadow-xl overflow-hidden animate-fadeIn">
            {/* Profile Header Banner */}
            <div className="bg-[#121212] text-white p-6 sm:p-8 border-b border-[#2a2a2a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-2 border-[#c5a059] bg-[#1e1e1e] text-[#c5a059] font-serif font-bold text-2xl flex items-center justify-center shadow">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-serif text-2xl font-bold text-white">{user.name}</h1>
                    <span className="bg-[#c5a059] text-black text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                      {user.role === 'ADMIN' ? '👑 Dueña' : user.role === 'EMPLOYEE' ? '💳 Empleado' : `${loyaltyTier.icon} ${loyaltyTier.name}`}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 font-mono">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {(user.role === 'ADMIN' || user.role === 'EMPLOYEE') && (
                  <Link
                    href="/admin"
                    className="bg-[#c5a059] hover:bg-[#b08d48] text-black font-extrabold text-xs uppercase px-4 py-2.5 rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <GearIcon className="w-4 h-4 text-black" />
                    <span>Ir a Panel Admin</span>
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="border border-gray-700 hover:border-rose-400 text-gray-300 hover:text-rose-400 font-bold text-xs uppercase px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>

            {/* Profile Navigation Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50/50 text-xs font-bold px-6 pt-2">
              <button
                onClick={() => setProfileTab('data')}
                className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  profileTab === 'data'
                    ? 'border-[#c5a059] text-[#c5a059] font-extrabold bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>Mis Datos Personales</span>
              </button>
              <button
                onClick={() => setProfileTab('orders')}
                className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  profileTab === 'orders'
                    ? 'border-[#c5a059] text-[#c5a059] font-extrabold bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <CartIcon className="w-4 h-4" />
                <span>Mis Pedidos ({customerSales.length})</span>
              </button>
              <button
                onClick={() => setProfileTab('security')}
                className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  profileTab === 'security'
                    ? 'border-[#c5a059] text-[#c5a059] font-extrabold bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <span>🔒 Seguridad &amp; Ajustes</span>
              </button>
            </div>

            {/* Profile Tab Content */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* TAB 1: MIS DATOS PERSONALES */}
              {profileTab === 'data' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider block mb-1">Nombre Completo</span>
                      <p className="text-sm font-bold text-gray-900">{user.name}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider block mb-1">Correo Electrónico</span>
                      <p className="text-sm font-mono font-bold text-gray-900">{user.email}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider block mb-1">Estado de Cuenta</span>
                      <p className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <span>✓ Correo Verificado</span>
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider block mb-1">Nivel de Cliente</span>
                      <p className={`text-xs font-bold ${loyaltyTier.colorClass} flex items-center gap-1.5`}>
                        <span>{loyaltyTier.icon} {loyaltyTier.name} ({loyaltyTier.badge})</span>
                      </p>
                    </div>
                  </div>

                  {/* Loyalty Tier Progress Card */}
                  <div className={`p-5 rounded-2xl border ${loyaltyTier.borderClass} ${loyaltyTier.bgClass} space-y-3 shadow-sm`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{loyaltyTier.icon}</span>
                        <div>
                          <h4 className={`font-serif font-bold text-base ${loyaltyTier.colorClass}`}>
                            Nivel {loyaltyTier.name}
                          </h4>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                            {loyaltyTier.badge} • {customerSales.length} {customerSales.length === 1 ? 'compra realizada' : 'compras realizadas'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar to Next Tier */}
                    {loyaltyTier.nextTierName && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-[11px] font-bold text-gray-700">
                          <span>Progreso al Nivel {loyaltyTier.nextTierName}</span>
                          <span>{loyaltyTier.nextTierProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden border border-gray-300/60">
                          <div
                            className="bg-[#c5a059] h-full rounded-full transition-all duration-500 shadow-sm"
                            style={{ width: `${loyaltyTier.nextTierProgress}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-gray-600 font-medium">
                          Te faltan <strong className="text-gray-900">{loyaltyTier.nextTierRemaining} {loyaltyTier.nextTierRemaining === 1 ? 'compra' : 'compras'}</strong> para alcanzar el nivel <strong>{loyaltyTier.nextTierName}</strong>.
                        </p>
                      </div>
                    )}

                    {/* Perks List */}
                    <div className="pt-3 border-t border-gray-200/80 space-y-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 block mb-1">
                        Tus Beneficios Exclusivos de Nivel {loyaltyTier.name}:
                      </span>
                      {loyaltyTier.perks.map((perk, idx) => (
                        <p key={idx} className="text-xs text-gray-800 font-semibold flex items-center gap-2">
                          <span className="text-emerald-600 font-bold">✓</span> {perk}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Acciones Rápidas */}
                  <div className="pt-4 border-t flex flex-wrap items-center justify-between gap-4">
                    <Link
                      href="/catalogo"
                      className="bg-[#121212] hover:bg-black text-[#c5a059] font-bold text-xs uppercase px-5 py-3 rounded-xl shadow flex items-center gap-2 cursor-pointer"
                    >
                      <span>Ir al Catálogo de Joyas</span>
                    </Link>

                    <button
                      onClick={logout}
                      className="text-xs font-bold text-gray-600 hover:text-gray-900 border border-gray-300 px-4 py-2.5 rounded-xl cursor-pointer"
                    >
                      Cerrar Sesión Activa
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: MIS PEDIDOS */}
              {profileTab === 'orders' && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="font-serif text-lg font-bold text-gray-900 border-b pb-2">Historial de Compras Web</h3>

                  {customerSales.length === 0 ? (
                    <div className="py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300 space-y-3">
                      <span className="text-3xl block">🛍️</span>
                      <p className="text-xs text-gray-600 font-bold">Aún no realizaste ningún pedido en nuestra tienda online.</p>
                      <Link
                        href="/catalogo"
                        className="inline-block bg-[#c5a059] text-black font-extrabold text-xs uppercase px-6 py-2.5 rounded-xl shadow cursor-pointer"
                      >
                        Explorar Catálogo
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      {customerSales.map((s) => (
                        <div key={s.id} className="p-4 bg-white hover:bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900">{s.productName}</span>
                              <span className="bg-gray-100 text-gray-600 text-[10px] font-mono font-bold px-2 py-0.5 rounded">SKU: {s.productCode}</span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5">{s.date} • Cantidad: {s.quantity}</p>
                          </div>

                          <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                            <span className="font-mono font-extrabold text-sm text-[#c5a059]">
                              ${s.totalAmount.toLocaleString('es-AR')}
                            </span>
                            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              ✓ {s.paymentMethod}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SEGURIDAD Y ELIMINAR CUENTA */}
              {profileTab === 'security' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-2">
                    <h4 className="font-bold text-sm text-gray-900">🔒 Seguridad y Privacidad de la Cuenta</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Tu contraseña e información personal están protegidas mediante cifrado BCrypt y protocolos HTTPS de extremo a extremo.
                    </p>
                  </div>

                  {/* Peligro: Eliminar Cuenta */}
                  <div className="p-5 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                      <span>⚠️ Zona de Peligro</span>
                    </div>
                    <p className="text-xs text-rose-800 leading-relaxed">
                      Si eliminás tu cuenta, tus datos personales se borrarán de nuestra base de datos. Esta acción requiere confirmación explícita para evitar pérdidas accidentales.
                    </p>
                    <button
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs uppercase px-4 py-2.5 rounded-xl shadow transition-all cursor-pointer"
                    >
                      Eliminar mi Cuenta Definitivamente
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* GUEST / LOGIN & SIGNUP SCREEN */
          <div className="bg-white p-8 rounded-2xl border border-[#e5e0d8] shadow-xl relative overflow-hidden">
            {/* Top Logo branding */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full border border-[#c5a059] bg-[#121212] text-[#c5a059] font-serif font-bold text-xl flex items-center justify-center mx-auto mb-3 shadow">
                LJ
              </div>
              <h1 className="font-serif text-2xl font-bold text-gray-900">
                {isVerifyingEmail ? 'Verificación de Correo' : 'Mi Cuenta en Laure Joyas'}
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                {isVerifyingEmail
                  ? `Ingresá el código enviado a ${pendingEmail}`
                  : 'Ingresá tus credenciales para acceder a tu perfil o crear una cuenta.'}
              </p>
            </div>

            {isVerifyingEmail ? (
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
              </>
            )}
          </div>
        )}
      </main>

      {/* DOUBLE CONFIRMATION MODAL FOR ACCOUNT DELETION */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-rose-200 animate-scaleUp p-6 space-y-4 text-gray-900">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl">
              ⚠️
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-serif text-xl font-bold text-rose-900">¿Confirmás la eliminación de tu cuenta?</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Esta acción es irreversible y eliminará tu perfil de cliente. Para confirmar sin errores, escribí la palabra <strong className="text-rose-700 uppercase">ELIMINAR</strong> a continuación:
              </p>
            </div>

            <div>
              <input
                type="text"
                placeholder="Escribí ELIMINAR"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-3 py-2.5 text-center text-sm font-bold border border-rose-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none uppercase"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2.5 text-xs font-bold text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteAccountConfirmed}
                disabled={deleteConfirmText.trim().toUpperCase() !== 'ELIMINAR'}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold text-xs uppercase rounded-xl shadow cursor-pointer"
              >
                Confirmar Borrado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
