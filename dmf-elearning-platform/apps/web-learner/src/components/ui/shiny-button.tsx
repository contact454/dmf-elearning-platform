'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes } from 'react';

interface ShinyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function ShinyButton({ children, className, ...props }: ShinyButtonProps) {
  return (
    <motion.button
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-white',
        'bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500',
        'hover:from-purple-600 hover:via-violet-600 hover:to-indigo-600',
        'shadow-lg hover:shadow-xl transition-shadow duration-300',
        'overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {/* Shiny overlay effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{
          repeat: Infinity,
          duration: 2,
          ease: 'linear',
        }}
      />

      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500" />

      {/* Content */}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
