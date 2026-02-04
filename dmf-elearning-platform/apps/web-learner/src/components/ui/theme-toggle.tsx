'use client';

import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from './theme-provider';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'icon' | 'button' | 'dropdown';
}

export function ThemeToggle({ className, showLabel = false, variant = 'icon' }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const Icon = theme === 'system' ? Monitor : resolvedTheme === 'dark' ? Moon : Sun;
  const label = theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light';

  if (variant === 'dropdown') {
    return (
      <div className={cn('relative', className)}>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
          <ThemeButton
            active={theme === 'light'}
            onClick={() => setTheme('light')}
            icon={<Sun className="w-4 h-4" />}
            label="Light"
          />
          <ThemeButton
            active={theme === 'dark'}
            onClick={() => setTheme('dark')}
            icon={<Moon className="w-4 h-4" />}
            label="Dark"
          />
          <ThemeButton
            active={theme === 'system'}
            onClick={() => setTheme('system')}
            icon={<Monitor className="w-4 h-4" />}
            label="System"
          />
        </div>
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <button
        onClick={cycleTheme}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
          'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700',
          'text-gray-700 dark:text-gray-300',
          className
        )}
      >
        <Icon className="w-4 h-4" />
        {showLabel && <span className="text-sm font-medium">{label}</span>}
      </button>
    );
  }

  // Default: icon variant
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={cycleTheme}
      className={cn(
        'relative p-2 rounded-lg transition-colors cursor-pointer',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        'text-gray-600 dark:text-gray-400',
        className
      )}
      title={`Theme: ${label}`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: resolvedTheme === 'dark' ? 180 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="w-5 h-5" />
        ) : (
          <Sun className="w-5 h-5" />
        )}
      </motion.div>
      {theme === 'system' && (
        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-500" />
      )}
    </motion.button>
  );
}

function ThemeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all cursor-pointer',
        active
          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
