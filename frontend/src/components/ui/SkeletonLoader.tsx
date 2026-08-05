'use client';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl animate-pulse ${className}`}
      style={{
        backgroundSize: '200% 100%',
      }}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="stitch-card p-4 space-y-4 animate-fadeIn">
      <Skeleton className="w-full h-52 rounded-xl" />
      <div className="space-y-2">
        <div className="flex gap-2">
          <Skeleton className="w-16 h-5 rounded-full" />
          <Skeleton className="w-20 h-5 rounded-full" />
        </div>
        <Skeleton className="w-3/4 h-6 rounded" />
        <Skeleton className="w-1/2 h-4 rounded" />
      </div>
      <div className="pt-3 border-t border-[#e8e3da]/60 space-y-2">
        <Skeleton className="w-full h-12 rounded-xl" />
        <Skeleton className="w-full h-10 rounded-full" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="p-4 flex items-center justify-between gap-4 animate-pulse">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
        <div className="space-y-1.5">
          <Skeleton className="w-32 h-4 rounded" />
          <Skeleton className="w-20 h-3 rounded" />
        </div>
      </div>
      <Skeleton className="w-24 h-8 rounded-full" />
    </div>
  );
}
