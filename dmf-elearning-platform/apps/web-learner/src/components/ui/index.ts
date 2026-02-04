// Skeleton components
export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonFlashcard,
  SkeletonList,
  SkeletonStats,
} from './skeleton';

// Button components
export { LoadingButton } from './loading-button';
export { ShinyButton } from './shiny-button';

// Toast system
export { ToastProvider, useToast } from './toast';

// Progress indicators
export { ProgressBar, CircularProgress, StepProgress } from './progress';

// Theme system
export { ThemeProvider, useTheme } from './theme-provider';
export { ThemeToggle } from './theme-toggle';

// Mobile/Responsive components
export { MobileBottomNav, TouchTarget, MobileIconButton } from './mobile-nav';
export {
  MobileFilterDrawer,
  MobileFilterTrigger,
  FilterChipGroup,
  ResponsiveSearch,
} from './mobile-filter';
export {
  ResponsiveContainer,
  ResponsiveGrid,
  PageWrapper,
  StickyHeader,
  TouchCard,
  HorizontalScroll,
  ScrollItem,
} from './responsive';

// Micro-interactions
export {
  RippleButton,
  XPGain,
  StreakFlame,
  AchievementUnlock,
  PulseIndicator,
  CountUp,
} from './micro-interactions';

// Magic components (default exports)
export { default as MagicCard } from './magic-card';
export { default as NumberTicker } from './number-ticker';
export { default as Confetti } from './confetti';
export { AIExplanationBox } from './ai-explanation-box';

// Animation utilities and components
export {
  // Variants
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  slideInFromBottom,
  slideInFromRight,
  staggerContainer,
  staggerContainerFast,
  staggerItem,
  staggerItemScale,
  shake,
  bounce,
  // Components
  PageTransition,
  AnimateOnScroll,
  StaggeredList,
  StaggeredItem,
  ShakeContainer,
  SuccessCheck,
  LiftCard,
  MagneticButton,
  TextReveal,
  AnimatedCounter,
  SkeletonTransition,
  FloatingElement,
  PulseGlow,
} from './animations';

// Animation effects (scroll, loading, backgrounds)
export {
  ScrollProgress,
  PageLoading,
  AnimatedGradient,
  Typewriter,
  MorphingBlob,
  Parallax,
  RevealOnHover,
  AnimatedBorder,
} from './animation-effects';
