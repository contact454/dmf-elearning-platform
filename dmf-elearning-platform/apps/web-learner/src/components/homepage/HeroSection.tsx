'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import NumberTicker from '@/components/ui/number-ticker';
import { Sparkles, BookOpen } from 'lucide-react';

export function HeroSection() {
  const t = useTranslations('hero');
  
  const stats = [
    { value: 15000, label: t('stats.vocabulary'), suffix: '+' },
    { value: 500, label: t('stats.lessons'), suffix: '+' },
    { value: 24, label: t('stats.aiSupport'), suffix: '/7' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 via-white to-indigo-50/50" />

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />

      {/* German Flag Stripes (Subtle) */}
      <div className="absolute top-0 right-0 w-2 h-full hidden lg:block">
        <div className="h-1/3 bg-black/10" />
        <div className="h-1/3 bg-yellow-500/20" />
        <div className="h-1/3 bg-red-500/20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            {t('badge')}
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-indigo-950 font-[family-name:var(--font-outfit)] leading-tight"
          >
            {t('title')}{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {t('titleHighlight')}
            </span>
            <br />
            <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
              {t('subtitle')}
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-indigo-700/80 max-w-2xl mx-auto font-[family-name:var(--font-inter)]"
          >
            {t('description')}
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-wrap justify-center gap-8 sm:gap-12"
          >
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-indigo-900 font-[family-name:var(--font-space-grotesk)]">
                  <NumberTicker value={stat.value} delay={0.3 + index * 0.1} />
                  <span>{stat.suffix}</span>
                </div>
                <div className="text-sm text-indigo-600 font-medium mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/auth/login"
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-2xl shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300 hover:scale-105"
            >
              <Sparkles className="w-5 h-5" />
              {t('cta.tryFree')}
              <motion.div
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              />
            </Link>
            <Link
              href="/learn/german"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-indigo-700 font-semibold rounded-2xl border-2 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-300"
            >
              <BookOpen className="w-5 h-5" />
              {t('cta.viewCourses')}
            </Link>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {/* Avatar Stack */}
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1 text-yellow-500">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
                <span className="text-indigo-900 font-semibold ml-2">{t('socialProof.rating')}</span>
              </div>
              <p className="text-indigo-600 text-sm">
                {t('socialProof.trustedBy')} <span className="font-semibold">2,500+</span> {t('socialProof.students')}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="w-6 h-10 border-2 border-indigo-300 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="w-1.5 h-3 bg-indigo-400 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
