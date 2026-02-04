'use client';

import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: boolean;
}

const sizeClasses = {
  sm: 'max-w-3xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
};

export function ResponsiveContainer({
  children,
  className,
  size = 'xl',
  padding = true,
}: ResponsiveContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full',
        sizeClasses[size],
        padding && 'px-4 sm:px-6 lg:px-8',
        className
      )}
    >
      {children}
    </div>
  );
}

// Responsive grid that adapts to content
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}

const gapClasses = {
  sm: 'gap-2 sm:gap-3',
  md: 'gap-3 sm:gap-4',
  lg: 'gap-4 sm:gap-6',
};

export function ResponsiveGrid({
  children,
  className,
  cols = { default: 1, md: 2, lg: 3 },
  gap = 'md',
}: ResponsiveGridProps) {
  const gridCols = [
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cn('grid', gridCols, gapClasses[gap], className)}>
      {children}
    </div>
  );
}

// Page wrapper with proper spacing for mobile nav
interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  gradient?: string;
}

export function PageWrapper({
  children,
  className,
  gradient = 'from-slate-50 via-white to-indigo-50/30',
}: PageWrapperProps) {
  return (
    <div
      className={cn(
        'min-h-screen bg-gradient-to-br',
        gradient,
        'pb-20 md:pb-0', // Space for mobile bottom nav
        className
      )}
    >
      {children}
    </div>
  );
}

// Sticky header with proper mobile handling
interface StickyHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function StickyHeader({ children, className }: StickyHeaderProps) {
  return (
    <header
      className={cn(
        'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm',
        'border-b border-gray-200 dark:border-gray-800',
        'sticky top-0 z-40',
        className
      )}
    >
      <ResponsiveContainer className="py-4">
        {children}
      </ResponsiveContainer>
    </header>
  );
}

// Card that's touch-friendly
interface TouchCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
}

export function TouchCard({
  children,
  className,
  onClick,
}: TouchCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white dark:bg-gray-900 rounded-2xl',
        'border border-gray-200 dark:border-gray-800',
        'overflow-hidden transition-all',
        'hover:shadow-lg active:scale-[0.98]',
        'cursor-pointer touch-manipulation',
        className
      )}
    >
      {children}
    </div>
  );
}

// Horizontal scroll container for mobile
interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
}

export function HorizontalScroll({ children, className }: HorizontalScrollProps) {
  return (
    <div
      className={cn(
        'flex overflow-x-auto scrollbar-hide scroll-snap-x',
        '-mx-4 px-4 sm:mx-0 sm:px-0',
        'gap-3 sm:gap-4',
        className
      )}
    >
      {children}
    </div>
  );
}

// Scroll item that snaps
export function ScrollItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex-shrink-0 scroll-snap-item', className)}>
      {children}
    </div>
  );
}
