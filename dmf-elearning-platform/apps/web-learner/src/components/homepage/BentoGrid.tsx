'use client';

import { motion, type Variants } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Brain, Gamepad2, Trophy, LineChart, Bot } from 'lucide-react';
import { useState } from 'react';

const features = [
  {
    id: 'courses',
    title: 'Khoá Học A1-C2',
    description: 'Lộ trình học bài bản theo chuẩn Goethe, từ cơ bản đến nâng cao.',
    icon: BookOpen,
    gradient: 'from-indigo-500 to-purple-600',
    glowColor: 'indigo',
    size: 'large',
    href: '/learn/german',
  },
  {
    id: 'flashcards',
    title: 'Flashcards',
    description: '15,000+ từ vựng với Spaced Repetition.',
    icon: Brain,
    gradient: 'from-emerald-500 to-teal-600',
    glowColor: 'emerald',
    size: 'small',
    href: '/practice/flashcard',
  },
  {
    id: 'quiz',
    title: 'Quiz Game',
    description: 'AI tạo câu hỏi thích ứng theo level.',
    icon: Gamepad2,
    gradient: 'from-orange-500 to-red-500',
    glowColor: 'orange',
    size: 'small',
    href: '/quiz',
  },
  {
    id: 'leaderboard',
    title: 'Bảng Xếp Hạng',
    description: 'Thi đua cùng cộng đồng.',
    icon: Trophy,
    gradient: 'from-yellow-500 to-orange-500',
    glowColor: 'yellow',
    size: 'small',
    href: '/dashboard/leaderboard',
  },
  {
    id: 'progress',
    title: 'Theo Dõi Tiến Độ',
    description: 'Biểu đồ học tập, Streak, XP Points và Spaced Repetition thông minh.',
    icon: LineChart,
    gradient: 'from-blue-500 to-cyan-500',
    glowColor: 'blue',
    size: 'wide',
    href: '/dashboard',
  },
];

// Animation variants for stagger effect
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// Loading skeleton component
const FeatureCardSkeleton = ({ size }: { size: string }) => (
  <div
    className={`
      ${size === 'large' ? 'md:col-span-2 md:row-span-2' : ''}
      ${size === 'wide' ? 'md:col-span-2 lg:col-span-3' : ''}
    `}
  >
    <div className="h-full bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-3xl p-6 lg:p-8 animate-pulse">
      <div className="w-14 h-14 rounded-2xl bg-gray-200" />
      <div className="mt-6 h-7 bg-gray-200 rounded-lg w-3/4" />
      <div className="mt-3 h-4 bg-gray-200 rounded w-full" />
      <div className="mt-2 h-4 bg-gray-200 rounded w-5/6" />
      <div className="mt-6 h-4 bg-gray-200 rounded w-24" />
    </div>
  </div>
);

// Glow color mapping
const glowColors: Record<string, string> = {
  indigo: 'shadow-indigo-500/30 hover:shadow-indigo-500/50',
  emerald: 'shadow-emerald-500/30 hover:shadow-emerald-500/50',
  orange: 'shadow-orange-500/30 hover:shadow-orange-500/50',
  yellow: 'shadow-yellow-500/30 hover:shadow-yellow-500/50',
  blue: 'shadow-blue-500/30 hover:shadow-blue-500/50',
  purple: 'shadow-purple-500/30 hover:shadow-purple-500/50',
};

export function BentoGrid() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-indigo-950 font-[family-name:var(--font-outfit)]">
            Tất Cả Trong{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Một Nền Tảng
            </span>
          </h2>
          <p className="mt-4 text-lg text-indigo-700/70 max-w-2xl mx-auto">
            Công cụ học tập toàn diện giúp bạn chinh phục tiếng Đức nhanh chóng
          </p>
        </motion.div>

        {/* Bento Grid */}
        {isLoading ? (
          // Loading Skeleton
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {features.map((feature) => (
              <FeatureCardSkeleton key={feature.id} size={feature.size} />
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.id}
                variants={cardVariants}
                className={`
                  ${feature.size === 'large' ? 'md:col-span-2 md:row-span-2' : ''}
                  ${feature.size === 'wide' ? 'md:col-span-2 lg:col-span-3' : ''}
                `}
              >
                <Link
                  href={feature.href}
                  className={`
                    group block h-full bg-gradient-to-br from-gray-50 to-white
                    border border-gray-100 rounded-3xl p-6 lg:p-8
                    hover:shadow-2xl ${glowColors[feature.glowColor]}
                    hover:-translate-y-1 hover:scale-[1.02]
                    active:scale-[0.98] active:shadow-lg
                    transition-all duration-300 cursor-pointer
                    focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:ring-offset-2
                    relative overflow-hidden
                  `}
                  aria-label={`${feature.title}: ${feature.description}`}
                  role="link"
                  tabIndex={0}
                >
                  {/* Gradient glow overlay on hover */}
                  <div
                    className={`
                      absolute inset-0 bg-gradient-to-br ${feature.gradient}
                      opacity-0 group-hover:opacity-5
                      transition-opacity duration-300 rounded-3xl
                    `}
                    aria-hidden="true"
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    <div
                      className={`
                        w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient}
                        flex items-center justify-center shadow-lg
                        group-hover:scale-110 group-hover:rotate-3
                        transition-transform duration-300
                      `}
                      aria-hidden="true"
                    >
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>

                    <h3 className="mt-6 text-xl lg:text-2xl font-bold text-indigo-950 font-[family-name:var(--font-outfit)] group-hover:text-indigo-700 transition-colors">
                      {feature.title}
                    </h3>

                    <p className="mt-3 text-indigo-700/70 leading-relaxed">
                      {feature.description}
                    </p>

                    <div
                      className="mt-6 flex items-center text-indigo-600 font-medium group-hover:text-indigo-700"
                      aria-hidden="true"
                    >
                      <span>Khám phá</span>
                      <svg
                        className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
