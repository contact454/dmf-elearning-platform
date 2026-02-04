'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';
import { Loader2, Check, X } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonState = 'idle' | 'loading' | 'success' | 'error';

interface LoadingButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  state?: ButtonState;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25',
  secondary: 'bg-white/80 backdrop-blur-sm text-indigo-700 border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300',
  ghost: 'bg-transparent text-indigo-600 hover:bg-indigo-50',
  danger: 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/25',
  success: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/25',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-base rounded-xl gap-2',
  lg: 'px-7 py-3.5 text-lg rounded-2xl gap-3',
};

const iconSizes: Record<ButtonSize, number> = {
  sm: 14,
  md: 18,
  lg: 22,
};

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      state = 'idle',
      loadingText,
      successText,
      errorText,
      leftIcon,
      rightIcon,
      disabled,
      onClick,
      type = 'button',
    },
    ref
  ) => {
    const isLoading = state === 'loading';
    const isSuccess = state === 'success';
    const isError = state === 'error';
    const isDisabled = disabled || isLoading;
    const iconSize = iconSizes[size];

    const getContent = () => {
      if (isLoading) return loadingText || children;
      if (isSuccess) return successText || 'Success!';
      if (isError) return errorText || 'Error';
      return children;
    };

    const getIcon = () => {
      if (isLoading) {
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          >
            <Loader2 size={iconSize} />
          </motion.div>
        );
      }
      if (isSuccess) {
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <Check size={iconSize} />
          </motion.div>
        );
      }
      if (isError) {
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <X size={iconSize} />
          </motion.div>
        );
      }
      return leftIcon;
    };

    return (
      <motion.button
        ref={ref}
        whileHover={!isDisabled ? { scale: 1.02 } : undefined}
        whileTap={!isDisabled ? { scale: 0.98 } : undefined}
        transition={{ duration: 0.15 }}
        className={cn(
          'relative inline-flex items-center justify-center font-medium cursor-pointer',
          'transition-all duration-200 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
          variantStyles[isSuccess ? 'success' : isError ? 'danger' : variant],
          sizeStyles[size],
          className
        )}
        disabled={isDisabled}
        onClick={onClick}
        type={type}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={state}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2"
          >
            {getIcon()}
            <span>{getContent()}</span>
            {!isLoading && !isSuccess && !isError && rightIcon}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';
