'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Sparkles, Zap, Star, Trophy } from 'lucide-react';

interface RippleButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function RippleButton({ children, className, onClick }: RippleButtonProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);

    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'relative overflow-hidden px-6 py-3 rounded-xl font-medium',
        'bg-gradient-to-r from-indigo-500 to-purple-600 text-white',
        'hover:from-indigo-600 hover:to-purple-700 transition-all duration-200',
        'cursor-pointer',
        className
      )}
    >
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute w-20 h-20 bg-white/30 rounded-full pointer-events-none"
            style={{
              left: ripple.x - 40,
              top: ripple.y - 40,
            }}
          />
        ))}
      </AnimatePresence>
      <span className="relative z-10">{children}</span>
    </button>
  );
}

interface XPGainProps {
  amount: number;
  show: boolean;
  onComplete?: () => void;
}

export function XPGain({ amount, show, onComplete }: XPGainProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: -40, scale: 1 }}
          exit={{ opacity: 0, y: -60, scale: 0.8 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          onAnimationComplete={onComplete}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold shadow-lg shadow-orange-500/30">
            <Zap size={18} className="fill-current" />
            <span>+{amount} XP</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface StreakFlameProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
}

export function StreakFlame({ streak, size = 'md' }: StreakFlameProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
  };

  const isHot = streak >= 7;
  const isOnFire = streak >= 30;

  return (
    <motion.div
      animate={isOnFire ? { scale: [1, 1.1, 1] } : undefined}
      transition={{ repeat: Infinity, duration: 0.5 }}
      className={cn(
        'relative flex items-center justify-center rounded-full',
        sizes[size],
        isOnFire
          ? 'bg-gradient-to-br from-orange-500 to-red-600'
          : isHot
          ? 'bg-gradient-to-br from-amber-400 to-orange-500'
          : 'bg-gradient-to-br from-slate-300 to-slate-400'
      )}
    >
      <motion.div
        animate={streak > 0 ? { y: [0, -2, 0] } : undefined}
        transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
        className="absolute -top-1"
      >
        🔥
      </motion.div>
      <span className="font-bold text-white">{streak}</span>
    </motion.div>
  );
}

interface AchievementUnlockProps {
  show: boolean;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  onComplete?: () => void;
}

export function AchievementUnlock({
  show,
  title,
  description,
  icon,
  onComplete,
}: AchievementUnlockProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onAnimationComplete={() => {
            if (onComplete) {
              setTimeout(onComplete, 2000);
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <div className="relative">
            {/* Glow effect */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.5, opacity: [0, 0.5, 0] }}
              transition={{ duration: 1, repeat: 2 }}
              className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full blur-2xl"
            />

            {/* Card */}
            <motion.div
              initial={{ rotateY: -90 }}
              animate={{ rotateY: 0 }}
              transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
              className="relative px-8 py-6 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-100 border-2 border-amber-300 shadow-2xl"
            >
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
                  className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-white"
                >
                  {icon || <Trophy size={28} />}
                </motion.div>
                <div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-2"
                  >
                    <Sparkles size={16} className="text-amber-500" />
                    <span className="text-xs font-medium text-amber-600 uppercase tracking-wider">
                      Achievement Unlocked!
                    </span>
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-xl font-bold text-amber-900"
                  >
                    {title}
                  </motion.h3>
                  {description && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="text-sm text-amber-700"
                    >
                      {description}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Stars decoration */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.2, 0.5],
                    x: [0, (i - 1) * 40],
                    y: [0, -20 - i * 10],
                  }}
                  transition={{
                    delay: 0.8 + i * 0.1,
                    duration: 1,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                  className="absolute top-0 left-1/2 text-amber-400"
                >
                  <Star size={16} className="fill-current" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface PulseIndicatorProps {
  active?: boolean;
  color?: 'green' | 'red' | 'blue' | 'amber';
  size?: 'sm' | 'md' | 'lg';
}

export function PulseIndicator({
  active = true,
  color = 'green',
  size = 'md',
}: PulseIndicatorProps) {
  const colors = {
    green: 'bg-emerald-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
  };

  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <span className="relative flex">
      {active && (
        <span
          className={cn(
            'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
            colors[color]
          )}
        />
      )}
      <span className={cn('relative inline-flex rounded-full', sizes[size], colors[color])} />
    </span>
  );
}

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CountUp({
  end,
  duration = 1000,
  prefix = '',
  suffix = '',
  className,
}: CountUpProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = 0;

    const updateCount = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + (end - startValue) * easeOut);

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
  }, [end, duration]);

  return (
    <span className={className}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}
