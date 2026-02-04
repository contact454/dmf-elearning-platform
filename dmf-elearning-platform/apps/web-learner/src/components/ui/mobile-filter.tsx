'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterOption {
  value: string;
  label: string;
}

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function MobileFilterDrawer({
  isOpen,
  onClose,
  title = 'Filters',
  children,
}: MobileFilterDrawerProps) {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
          >
            <div className="bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden">
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors touch-manipulation"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-4 overflow-y-auto max-h-[60vh] pb-safe">
                {children}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 pb-safe">
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors touch-manipulation"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Mobile-friendly filter chip group
interface FilterChipGroupProps {
  label: string;
  options: FilterOption[];
  selected: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FilterChipGroup({
  label,
  options,
  selected,
  onChange,
  className,
}: FilterChipGroupProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'px-4 py-2.5 rounded-xl text-sm font-medium transition-all touch-manipulation',
              'min-h-[44px] min-w-[44px]',
              selected === option.value
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Mobile filter trigger button
interface MobileFilterTriggerProps {
  onClick: () => void;
  activeCount?: number;
  className?: string;
}

export function MobileFilterTrigger({
  onClick,
  activeCount = 0,
  className,
}: MobileFilterTriggerProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'md:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl',
        'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
        'text-gray-700 dark:text-gray-300 font-medium text-sm',
        'min-h-[44px] touch-manipulation shadow-sm',
        'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
        className
      )}
    >
      <Filter className="w-4 h-4" />
      <span>Filters</span>
      {activeCount > 0 && (
        <span className="flex items-center justify-center w-5 h-5 bg-indigo-600 text-white text-xs rounded-full">
          {activeCount}
        </span>
      )}
    </button>
  );
}

// Responsive search input
interface ResponsiveSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
}

export function ResponsiveSearch({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search...',
  className,
}: ResponsiveSearchProps) {
  return (
    <div className={cn('relative', className)}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit?.()}
        placeholder={placeholder}
        className={cn(
          'w-full px-4 py-3 pl-11 rounded-xl',
          'bg-white dark:bg-gray-800',
          'border border-gray-200 dark:border-gray-700',
          'text-gray-900 dark:text-white',
          'placeholder:text-gray-500 dark:placeholder:text-gray-400',
          'text-base', // Prevents zoom on iOS
          'min-h-[48px]', // Touch-friendly
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
          'transition-all'
        )}
      />
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
}
