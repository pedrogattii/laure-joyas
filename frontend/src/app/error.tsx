'use client';

import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5]">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
          ⚠️
        </div>
        <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">
          Ocurrió un error inesperado
        </h2>
        <p className="text-xs text-gray-600 mb-6 leading-relaxed">
          No te preocupes, tus datos y ventas están resguardados. Por favor volvé a intentar o recargá la página.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => reset()}
            className="bg-[#c5a059] hover:bg-[#a8843e] text-black font-bold text-xs uppercase px-6 py-3 rounded shadow transition-all cursor-pointer"
          >
            Reintentar
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-[#121212] hover:bg-black text-white font-bold text-xs uppercase px-6 py-3 rounded shadow transition-all cursor-pointer"
          >
            Ir al Inicio
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
