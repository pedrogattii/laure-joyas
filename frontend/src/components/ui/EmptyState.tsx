'use client';

import React from 'react';

interface EmptyStateProps {
  icon?: string | React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon = '💎',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="stitch-card p-12 text-center max-w-md mx-auto my-8 space-y-4 animate-fadeIn">
      <div className="w-16 h-16 rounded-full bg-gold/10 text-gold border border-gold/20 flex items-center justify-center mx-auto text-3xl shadow-xs">
        {icon}
      </div>
      <div>
        <h3 className="font-serif text-xl font-bold text-[#1a1918] mb-1.5">{title}</h3>
        <p className="text-xs text-gray-500 font-sans leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <div className="pt-2">
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
