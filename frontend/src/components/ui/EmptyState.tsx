'use client';

import React from 'react';
import { DiamondIcon } from '@/components/icons/SvgIcons';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon = <DiamondIcon className="w-8 h-8 text-gold" />,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`stitch-card p-10 text-center max-w-md mx-auto my-8 space-y-4 animate-fadeIn ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#fdf9f0] to-[#f5ecda] border border-gold/30 flex items-center justify-center mx-auto shadow-xs text-gold">
        {icon}
      </div>
      <div className="space-y-1.5">
        <h3 className="font-serif text-xl font-bold text-[#1a1918] tracking-tight">{title}</h3>
        <p className="text-xs text-gray-500 font-sans leading-relaxed max-w-xs mx-auto">{description}</p>
      </div>
      {actionLabel && onAction && (
        <div className="pt-3">
          <button
            onClick={onAction}
            className="btn-stitch-gold text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full shadow-sm cursor-pointer active:scale-95"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
}

