'use client';

import React from 'react';

export type BadgeVariant = 'gold' | 'dark' | 'success' | 'warning' | 'info' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: React.ReactNode;
}

export function Badge({
  children,
  variant = 'gold',
  size = 'md',
  className = '',
  icon,
}: BadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-xs gap-2 font-medium',
  }[size];

  const variantClasses = {
    gold: 'bg-gradient-to-r from-[#fdf9f0] to-[#f5ecda] text-[#8a6b29] border border-[#c5a059]/40 font-semibold shadow-xs',
    dark: 'bg-[#1a1918] text-[#f5ecda] border border-[#c5a059]/30 font-medium',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-medium',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200/80 font-medium',
    info: 'bg-sky-50 text-sky-800 border border-sky-200/80 font-medium',
    outline: 'bg-transparent text-[#1a1918] border border-[#e8e3da] font-medium',
  }[variant];

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full transition-all duration-200 ${sizeClasses} ${variantClasses} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
