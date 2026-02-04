'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]',
        className
      )}
    />
  );
}

export function SkeletonText({ className, lines = 3 }: SkeletonProps & { lines?: number }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className, children }: SkeletonProps) {
  if (children) {
    return (
      <div
        className={cn(
          'rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden',
          className
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-2xl bg-white/80 backdrop-blur-sm p-6 shadow-lg',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonFlashcard({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-3xl bg-white/90 backdrop-blur-sm p-8 shadow-xl',
        'flex flex-col items-center justify-center min-h-[300px]',
        className
      )}
    >
      <Skeleton className="h-8 w-32 mb-4" />
      <Skeleton className="h-12 w-48 mb-6" />
      <Skeleton className="h-6 w-40" />
    </div>
  );
}

export function SkeletonList({ className, count = 5 }: SkeletonProps & { count?: number }) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm"
        >
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats({ className }: SkeletonProps) {
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-xl bg-white/60 backdrop-blur-sm text-center"
        >
          <Skeleton className="h-8 w-16 mx-auto mb-2" />
          <Skeleton className="h-4 w-20 mx-auto" />
        </div>
      ))}
    </div>
  );
}
