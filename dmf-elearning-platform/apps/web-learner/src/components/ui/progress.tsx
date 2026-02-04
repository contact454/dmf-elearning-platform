'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient' | 'striped';
  showLabel?: boolean;
  label?: string;
  className?: string;
  animated?: boolean;
}

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  className,
  animated = true,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2 text-sm">
          <span className="text-slate-600">{label}</span>
          {showLabel && (
            <span className="font-medium text-indigo-600">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full bg-slate-200 rounded-full overflow-hidden',
          sizeStyles[size]
        )}
      >
        <motion.div
          initial={animated ? { width: 0 } : false}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className={cn(
            'h-full rounded-full',
            variant === 'default' && 'bg-indigo-500',
            variant === 'gradient' && 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500',
            variant === 'striped' && [
              'bg-indigo-500 relative overflow-hidden',
              'after:absolute after:inset-0',
              'after:bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_25%,rgba(255,255,255,0.2)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.2)_75%)]',
              'after:bg-[length:1rem_1rem]',
              'after:animate-[shimmer_1s_linear_infinite]',
            ]
          )}
        />
      </div>
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  variant?: 'default' | 'gradient';
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  showLabel = true,
  variant = 'default',
  className,
}: CircularProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const gradientId = `progress-gradient-${Math.random().toString(36).slice(2)}`;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {variant === 'gradient' && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="50%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
        )}

        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200"
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={variant === 'gradient' ? `url(#${gradientId})` : 'currentColor'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
          className={variant === 'default' ? 'text-indigo-500' : ''}
        />
      </svg>

      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="text-lg font-semibold text-slate-700"
          >
            {Math.round(percentage)}%
          </motion.span>
        </div>
      )}
    </div>
  );
}

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  className?: string;
}

export function StepProgress({
  currentStep,
  totalSteps,
  labels,
  className,
}: StepProgressProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div key={index} className="flex items-center flex-1 last:flex-none">
            {/* Step circle */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'relative flex items-center justify-center w-10 h-10 rounded-full font-medium text-sm transition-colors duration-300',
                index < currentStep
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                  : index === currentStep
                  ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-500 ring-offset-2'
                  : 'bg-slate-200 text-slate-500'
              )}
            >
              {index < currentStep ? (
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </motion.svg>
              ) : (
                index + 1
              )}
            </motion.div>

            {/* Connector line */}
            {index < totalSteps - 1 && (
              <div className="flex-1 h-1 mx-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: index < currentStep ? 1 : 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 origin-left"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {labels && labels.length > 0 && (
        <div className="flex justify-between mt-2">
          {labels.map((label, index) => (
            <span
              key={index}
              className={cn(
                'text-xs font-medium transition-colors duration-300',
                index <= currentStep ? 'text-indigo-600' : 'text-slate-400'
              )}
              style={{ width: `${100 / totalSteps}%`, textAlign: 'center' }}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
