'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, Clock, Users, ChevronRight } from 'lucide-react';

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

const courses = {
  A1: {
    title: 'Tiếng Đức cho người mới bắt đầu',
    description: 'Học giao tiếp cơ bản, chào hỏi, giới thiệu bản thân.',
    lessons: 50,
    duration: '3 tháng',
    students: 1200,
    color: 'from-green-500 to-emerald-600',
    badge: 'Beginner',
  },
  A2: {
    title: 'Tiếng Đức giao tiếp hàng ngày',
    description: 'Mua sắm, đi du lịch, nói về sở thích và công việc.',
    lessons: 75,
    duration: '4 tháng',
    students: 850,
    color: 'from-blue-500 to-cyan-600',
    badge: 'Elementary',
  },
  B1: {
    title: 'Tiếng Đức công việc văn phòng',
    description: 'Email, họp hành, trình bày ý kiến chuyên nghiệp.',
    lessons: 100,
    duration: '5 tháng',
    students: 620,
    color: 'from-purple-500 to-violet-600',
    badge: 'Intermediate',
  },
  B2: {
    title: 'Tiếng Đức nâng cao',
    description: 'Thảo luận phức tạp, đọc hiểu văn bản chuyên ngành.',
    lessons: 120,
    duration: '6 tháng',
    students: 380,
    color: 'from-orange-500 to-amber-600',
    badge: 'Upper-Int',
  },
  C1: {
    title: 'Tiếng Đức thành thạo',
    description: 'Viết học thuật, phân tích văn bản phức tạp.',
    lessons: 80,
    duration: '5 tháng',
    students: 150,
    color: 'from-red-500 to-rose-600',
    badge: 'Advanced',
  },
  C2: {
    title: 'Tiếng Đức bản ngữ',
    description: 'Thành thạo như người bản xứ, văn phong đa dạng.',
    lessons: 50,
    duration: '4 tháng',
    students: 45,
    color: 'from-indigo-600 to-purple-700',
    badge: 'Mastery',
  },
};

export function CourseShowcase() {
  const [activeLevel, setActiveLevel] = useState<keyof typeof courses>('A1');

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-50/50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-indigo-950 font-[family-name:var(--font-outfit)]">
            Khoá Học{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Nổi Bật
            </span>
          </h2>
          <p className="mt-4 text-lg text-indigo-700/70">
            Chọn level phù hợp với trình độ của bạn
          </p>
        </motion.div>

        {/* Level Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {levels.map((level) => (
            <button
              key={level}
              onClick={() => setActiveLevel(level)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeLevel === level
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-white text-indigo-700 border border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50'
              }`}
            >
              {level}
            </button>
          ))}
        </motion.div>

        {/* Course Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {levels.slice(0, 3).map((level, index) => {
              const course = courses[level];
              const isActive = level === activeLevel;

              return (
                <motion.div
                  key={level}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`relative ${isActive ? 'lg:scale-105 z-10' : ''}`}
                >
                  <Link href={`/learn/german/${level.toLowerCase()}`}>
                    <div
                      className={`h-full bg-white rounded-3xl p-6 border-2 transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 ${
                        isActive
                          ? 'border-indigo-300 shadow-xl shadow-indigo-500/20'
                          : 'border-gray-100 hover:border-indigo-200'
                      }`}
                    >
                      {/* Level Badge */}
                      <div
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold bg-gradient-to-r ${course.color}`}
                      >
                        {level} - {course.badge}
                      </div>

                      {/* Title */}
                      <h3 className="mt-5 text-xl font-bold text-indigo-950 font-[family-name:var(--font-outfit)]">
                        {course.title}
                      </h3>

                      {/* Description */}
                      <p className="mt-3 text-indigo-700/70 text-sm leading-relaxed">
                        {course.description}
                      </p>

                      {/* Stats */}
                      <div className="mt-6 flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 text-indigo-600">
                          <BookOpen className="w-4 h-4" />
                          <span>{course.lessons} bài</span>
                        </div>
                        <div className="flex items-center gap-2 text-indigo-600">
                          <Clock className="w-4 h-4" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-indigo-600">
                          <Users className="w-4 h-4" />
                          <span>{course.students}+ học viên</span>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="mt-6 flex items-center text-indigo-600 font-semibold group">
                        <span>Đăng ký ngay</span>
                        <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* View All */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/learn/german"
            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-100 text-indigo-700 font-semibold rounded-2xl hover:bg-indigo-200 transition-colors"
          >
            Xem tất cả khoá học
            <ChevronRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
