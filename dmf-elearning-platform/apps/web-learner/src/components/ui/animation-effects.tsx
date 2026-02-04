'use client';

import { motion, useScroll, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════
// Scroll Progress Indicator
// ═══════════════════════════════════════════════════════════════

interface ScrollProgressProps {
  className?: string;
  color?: string;
  height?: number;
  position?: 'top' | 'bottom';
}

export function ScrollProgress({
  className,
  color = 'bg-gradient-to-r from-indigo-500 to-purple-600',
  height = 3,
  position = 'top',
}: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className={cn(
        'fixed left-0 right-0 origin-left z-50',
        position === 'top' ? 'top-0' : 'bottom-0',
        color,
        className
      )}
      initial={{ height: 0 }}
      animate={{ height }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// Page Loading Overlay
// ═══════════════════════════════════════════════════════════════

interface PageLoadingProps {
  isLoading: boolean;
  variant?: 'spinner' | 'progress' | 'dots';
}

export function PageLoading({ isLoading, variant = 'spinner' }: PageLoadingProps) {
  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center"
    >
      {variant === 'spinner' && <LoadingSpinner />}
      {variant === 'progress' && <LoadingProgress />}
      {variant === 'dots' && <LoadingDots />}
    </motion.div>
  );
}

function LoadingSpinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full"
    />
  );
}

function LoadingProgress() {
  return (
    <div className="w-48">
      <motion.div
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ duration: 2, repeat: Infinity }}
        className="h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
      />
    </div>
  );
}

function LoadingDots() {
  return (
    <div className="flex gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
          }}
          className="w-3 h-3 bg-indigo-600 dark:bg-indigo-400 rounded-full"
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Animated Background Gradients
// ═══════════════════════════════════════════════════════════════

interface AnimatedGradientProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
}

export function AnimatedGradient({
  children,
  className,
  colors = ['from-indigo-500', 'via-purple-500', 'to-pink-500'],
}: AnimatedGradientProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <motion.div
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'linear',
        }}
        className={cn(
          'absolute inset-0 bg-gradient-to-r',
          colors.join(' '),
          'bg-[length:200%_100%]'
        )}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Typewriter Effect
// ═══════════════════════════════════════════════════════════════

interface TypewriterProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
  cursor?: boolean;
}

export function Typewriter({
  text,
  className,
  speed = 50,
  delay = 0,
  cursor = true,
}: TypewriterProps) {
  return (
    <motion.span className={cn('inline-block', className)}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.05, delay: delay + i * (speed / 1000) }}
        >
          {char}
        </motion.span>
      ))}
      {cursor && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block ml-0.5 w-0.5 h-[1em] bg-current"
        />
      )}
    </motion.span>
  );
}

// ═══════════════════════════════════════════════════════════════
// Morphing Shape Background
// ═══════════════════════════════════════════════════════════════

interface MorphingBlobProps {
  className?: string;
  color?: string;
  size?: number;
}

export function MorphingBlob({
  className,
  color = 'bg-indigo-400/30',
  size = 400,
}: MorphingBlobProps) {
  return (
    <motion.div
      animate={{
        borderRadius: [
          '60% 40% 30% 70% / 60% 30% 70% 40%',
          '30% 60% 70% 40% / 50% 60% 30% 60%',
          '60% 40% 30% 70% / 60% 30% 70% 40%',
        ],
        scale: [1, 1.1, 1],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{ width: size, height: size }}
      className={cn('absolute blur-3xl', color, className)}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
// Parallax Container
// ═══════════════════════════════════════════════════════════════

interface ParallaxProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}

export function Parallax({ children, className, speed = 0.5 }: ParallaxProps) {
  const { scrollY } = useScroll();
  const y = useSpring(scrollY, { stiffness: 100, damping: 30 });

  return (
    <motion.div style={{ y: `calc(${speed} * var(--scroll-y))` }} className={className}>
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Reveal on Hover Container
// ═══════════════════════════════════════════════════════════════

interface RevealOnHoverProps {
  children: React.ReactNode;
  overlay: React.ReactNode;
  className?: string;
}

export function RevealOnHover({ children, overlay, className }: RevealOnHoverProps) {
  return (
    <motion.div
      className={cn('relative overflow-hidden', className)}
      initial="rest"
      whileHover="hover"
      animate="rest"
    >
      {children}
      <motion.div
        variants={{
          rest: { opacity: 0, y: 20 },
          hover: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
      >
        {overlay}
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Animated Border
// ═══════════════════════════════════════════════════════════════

interface AnimatedBorderProps {
  children: React.ReactNode;
  className?: string;
  borderWidth?: number;
}

export function AnimatedBorder({
  children,
  className,
  borderWidth = 2,
}: AnimatedBorderProps) {
  return (
    <div className={cn('relative p-[2px] rounded-xl overflow-hidden', className)}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
        style={{ padding: borderWidth }}
      />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl">{children}</div>
    </div>
  );
}
