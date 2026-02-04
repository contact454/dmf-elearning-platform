'use client';

import { motion, AnimatePresence, useInView, Variants } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════
// Animation Variants Library
// ═══════════════════════════════════════════════════════════════

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: 10, transition: { duration: 0.2 } },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

export const slideInFromBottom: Variants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
  exit: { y: '100%', transition: { duration: 0.2 } },
};

export const slideInFromRight: Variants = {
  hidden: { x: '100%' },
  visible: { x: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
  exit: { x: '100%', transition: { duration: 0.2 } },
};

// Stagger container variants
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export const staggerItemScale: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

// Shake animation for errors
export const shake: Variants = {
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.5 },
  },
};

// Bounce animation for success
export const bounce: Variants = {
  bounce: {
    scale: [1, 1.2, 0.9, 1.1, 1],
    transition: { duration: 0.5 },
  },
};

// ═══════════════════════════════════════════════════════════════
// Page Transition Wrapper
// ═══════════════════════════════════════════════════════════════

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'fade' | 'fadeUp' | 'scale' | 'slideUp';
}

const pageVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  fadeUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
  },
  slideUp: {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
};

export function PageTransition({
  children,
  className,
  variant = 'fadeUp',
}: PageTransitionProps) {
  const pathname = usePathname();
  const variants = pageVariants[variant];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════
// Scroll-triggered Animation Components
// ═══════════════════════════════════════════════════════════════

interface AnimateOnScrollProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'fadeUp' | 'fadeIn' | 'fadeLeft' | 'fadeRight' | 'scale';
  delay?: number;
  once?: boolean;
  threshold?: number;
}

const scrollVariants = {
  fadeUp: fadeInUp,
  fadeIn: fadeIn,
  fadeLeft: fadeInLeft,
  fadeRight: fadeInRight,
  scale: scaleIn,
};

export function AnimateOnScroll({
  children,
  className,
  variant = 'fadeUp',
  delay = 0,
  once = true,
  threshold = 0.2,
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={scrollVariants[variant]}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Staggered List/Grid Animation
// ═══════════════════════════════════════════════════════════════

interface StaggeredListProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
  as?: 'div' | 'ul' | 'section';
}

export function StaggeredList({
  children,
  className,
  staggerDelay = 0.1,
  initialDelay = 0.1,
  as = 'div',
}: StaggeredListProps) {
  const Component = motion[as];

  return (
    <Component
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: initialDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </Component>
  );
}

interface StaggeredItemProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'li' | 'article';
}

export function StaggeredItem({
  children,
  className,
  as = 'div',
}: StaggeredItemProps) {
  const Component = motion[as];

  return (
    <Component variants={staggerItem} className={className}>
      {children}
    </Component>
  );
}

// ═══════════════════════════════════════════════════════════════
// Form Feedback Animations
// ═══════════════════════════════════════════════════════════════

interface ShakeContainerProps {
  children: React.ReactNode;
  shake: boolean;
  className?: string;
}

export function ShakeContainer({
  children,
  shake: shouldShake,
  className,
}: ShakeContainerProps) {
  return (
    <motion.div
      animate={shouldShake ? 'shake' : 'idle'}
      variants={{
        idle: { x: 0 },
        shake: {
          x: [0, -10, 10, -10, 10, -5, 5, 0],
          transition: { duration: 0.5 },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface SuccessCheckProps {
  show: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SuccessCheck({ show, size = 'md', className }: SuccessCheckProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 300 }}
          className={cn(
            'flex items-center justify-center rounded-full bg-emerald-500',
            sizeClasses[size],
            className
          )}
        >
          <motion.svg
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="w-1/2 h-1/2 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.path d="M5 13l4 4L19 7" />
          </motion.svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════
// Enhanced Card with Lift Effect
// ═══════════════════════════════════════════════════════════════

interface LiftCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  as?: 'div' | 'article' | 'button';
  liftAmount?: number;
}

export function LiftCard({
  children,
  className,
  onClick,
  as = 'div',
  liftAmount = 4,
}: LiftCardProps) {
  const Component = motion[as];

  return (
    <Component
      onClick={onClick}
      whileHover={{
        y: -liftAmount,
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn('cursor-pointer', className)}
    >
      {children}
    </Component>
  );
}

// ═══════════════════════════════════════════════════════════════
// Magnetic Button Effect
// ═══════════════════════════════════════════════════════════════

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  strength?: number;
}

export function MagneticButton({
  children,
  className,
  onClick,
  strength = 0.3,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) * strength;
    const y = (e.clientY - centerY) * strength;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      whileTap={{ scale: 0.95 }}
      className={className}
    >
      {children}
    </motion.button>
  );
}

// ═══════════════════════════════════════════════════════════════
// Text Reveal Animation
// ═══════════════════════════════════════════════════════════════

interface TextRevealProps {
  children: string;
  className?: string;
  delay?: number;
}

export function TextReveal({ children, className, delay = 0 }: TextRevealProps) {
  const words = children.split(' ');

  return (
    <motion.span
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.05,
            delayChildren: delay,
          },
        },
      }}
      className={className}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.3 }}
          className="inline-block mr-1"
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

// ═══════════════════════════════════════════════════════════════
// Counter Animation (Enhanced)
// ═══════════════════════════════════════════════════════════════

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  formatNumber?: boolean;
}

export function AnimatedCounter({
  value,
  duration = 1,
  className,
  prefix = '',
  suffix = '',
  formatNumber = true,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);

      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(eased * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration, isInView]);

  const formattedValue = formatNumber
    ? displayValue.toLocaleString()
    : displayValue.toString();

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
// Skeleton Transition (Smooth content swap)
// ═══════════════════════════════════════════════════════════════

interface SkeletonTransitionProps {
  isLoading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function SkeletonTransition({
  isLoading,
  skeleton,
  children,
  className,
}: SkeletonTransitionProps) {
  return (
    <div className={cn('relative', className)}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {skeleton}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Floating Animation (for decorative elements)
// ═══════════════════════════════════════════════════════════════

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  distance?: number;
}

export function FloatingElement({
  children,
  className,
  duration = 3,
  distance = 10,
}: FloatingElementProps) {
  return (
    <motion.div
      animate={{
        y: [-distance / 2, distance / 2, -distance / 2],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Pulse Glow Effect
// ═══════════════════════════════════════════════════════════════

interface PulseGlowProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export function PulseGlow({
  children,
  className,
  color = 'rgba(99, 102, 241, 0.5)',
}: PulseGlowProps) {
  return (
    <motion.div
      animate={{
        boxShadow: [
          `0 0 0 0 ${color}`,
          `0 0 0 10px transparent`,
          `0 0 0 0 ${color}`,
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={cn('rounded-full', className)}
    >
      {children}
    </motion.div>
  );
}
