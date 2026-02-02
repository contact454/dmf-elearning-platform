'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Brain, Gamepad2, Trophy, LineChart, Bot } from 'lucide-react';

const features = [
  {
    id: 'courses',
    title: 'Khoá Học A1-C2',
    description: 'Lộ trình học bài bản theo chuẩn Goethe, từ cơ bản đến nâng cao.',
    icon: BookOpen,
    gradient: 'from-indigo-500 to-purple-600',
    size: 'large',
    href: '/learn/german',
  },
  {
    id: 'flashcards',
    title: 'Flashcards',
    description: '15,000+ từ vựng với Spaced Repetition.',
    icon: Brain,
    gradient: 'from-emerald-500 to-teal-600',
    size: 'small',
    href: '/practice/flashcard',
  },
  {
    id: 'quiz',
    title: 'Quiz Game',
    description: 'AI tạo câu hỏi thích ứng theo level.',
    icon: Gamepad2,
    gradient: 'from-orange-500 to-red-500',
    size: 'small',
    href: '/quiz',
  },
  {
    id: 'leaderboard',
    title: 'Bảng Xếp Hạng',
    description: 'Thi đua cùng cộng đồng.',
    icon: Trophy,
    gradient: 'from-yellow-500 to-orange-500',
    size: 'small',
    href: '/dashboard/leaderboard',
  },
  {
    id: 'progress',
    title: 'Theo Dõi Tiến Độ',
    description: 'Biểu đồ học tập, Streak, XP Points và Spaced Repetition thông minh.',
    icon: LineChart,
    gradient: 'from-blue-500 to-cyan-500',
    size: 'wide',
    href: '/dashboard',
  },
];

export function BentoGrid() {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`
                ${feature.size === 'large' ? 'md:col-span-2 md:row-span-2' : ''}
                ${feature.size === 'wide' ? 'md:col-span-2 lg:col-span-3' : ''}
              `}
            >
              <Link
                href={feature.href}
                className="group block h-full bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-3xl p-6 lg:p-8 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="mt-6 text-xl lg:text-2xl font-bold text-indigo-950 font-[family-name:var(--font-outfit)] group-hover:text-indigo-700 transition-colors">
                  {feature.title}
                </h3>

                <p className="mt-3 text-indigo-700/70 leading-relaxed">
                  {feature.description}
                </p>

                <div className="mt-6 flex items-center text-indigo-600 font-medium group-hover:text-indigo-700">
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
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
