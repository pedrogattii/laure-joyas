'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-dismiss after 3.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container — fixed bottom-center, mobile-friendly */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[90vw] max-w-sm pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3.5 rounded-lg shadow-xl border text-sm font-semibold animate-slideUp ${getToastStyles(toast.type)}`}
              role="alert"
            >
              <span className="text-lg shrink-0">{getToastIcon(toast.type)}</span>
              <span className="flex-1 leading-snug">{toast.message}</span>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-current opacity-60 hover:opacity-100 text-lg font-bold shrink-0 ml-1"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser usado dentro de un ToastProvider');
  }
  return context;
}

function getToastStyles(type: ToastType): string {
  switch (type) {
    case 'success':
      return 'bg-emerald-900 text-emerald-100 border-emerald-700';
    case 'error':
      return 'bg-rose-900 text-rose-100 border-rose-700';
    case 'warning':
      return 'bg-amber-900 text-amber-100 border-amber-700';
    case 'info':
      return 'bg-sky-900 text-sky-100 border-sky-700';
  }
}

function getToastIcon(type: ToastType): string {
  switch (type) {
    case 'success':
      return '✓';
    case 'error':
      return '✕';
    case 'warning':
      return '⚠';
    case 'info':
      return 'ℹ';
  }
}
