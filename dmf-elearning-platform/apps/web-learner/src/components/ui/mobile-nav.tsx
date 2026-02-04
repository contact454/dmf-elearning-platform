'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Home,
  BookOpen,
  Headphones,
  Mic,
  PenTool,
  Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  activeColor: string;
}

const navItems: NavItem[] = [
  {
    href: '/learn/hub',
    label: 'Hub',
    icon: Home,
    color: 'text-gray-500 dark:text-gray-400',
    activeColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    href: '/learn/reading',
    label: 'Read',
    icon: BookOpen,
    color: 'text-gray-500 dark:text-gray-400',
    activeColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    href: '/learn/listening',
    label: 'Listen',
    icon: Headphones,
    color: 'text-gray-500 dark:text-gray-400',
    activeColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    href: '/learn/speaking',
    label: 'Speak',
    icon: Mic,
    color: 'text-gray-500 dark:text-gray-400',
    activeColor: 'text-rose-600 dark:text-rose-400',
  },
  {
    href: '/learn/writing',
    label: 'Write',
    icon: PenTool,
    color: 'text-gray-500 dark:text-gray-400',
    activeColor: 'text-amber-600 dark:text-amber-400',
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  // Only show on learning module pages
  const isLearningPage = pathname?.startsWith('/learn');
  if (!isLearningPage) return null;

  return (
    <>
      {/* Spacer to prevent content from being hidden behind nav */}
      <div className="h-20 md:hidden" />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        {/* Glass background */}
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800" />

        {/* Safe area padding for notched devices */}
        <div className="relative flex items-center justify-around px-2 py-2 pb-safe">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/learn/hub' && pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center min-w-[64px] min-h-[56px] touch-manipulation"
              >
                <motion.div
                  className={cn(
                    'flex flex-col items-center justify-center p-2 rounded-xl transition-colors',
                    isActive ? 'bg-gray-100 dark:bg-gray-800' : ''
                  )}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon
                    className={cn(
                      'w-6 h-6 transition-colors',
                      isActive ? item.activeColor : item.color
                    )}
                  />
                  <span
                    className={cn(
                      'text-[10px] font-medium mt-1 transition-colors',
                      isActive ? item.activeColor : item.color
                    )}
                  >
                    {item.label}
                  </span>

                  {/* Active indicator dot */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className={cn(
                        'absolute -top-1 w-1 h-1 rounded-full',
                        item.activeColor.replace('text-', 'bg-')
                      )}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

// Touch-friendly button wrapper with 44px minimum touch target
export function TouchTarget({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('relative min-w-[44px] min-h-[44px] flex items-center justify-center', className)}>
      {children}
    </div>
  );
}

// Mobile-optimized icon button
export function MobileIconButton({
  children,
  onClick,
  className,
  label,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  label: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'min-w-[44px] min-h-[44px] flex items-center justify-center',
        'rounded-xl transition-colors touch-manipulation',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        'active:bg-gray-200 dark:active:bg-gray-700',
        className
      )}
      aria-label={label}
    >
      {children}
    </motion.button>
  );
}
