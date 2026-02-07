'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, BookOpen, Brain, Trophy, Users, Target } from 'lucide-react';
import { LanguageSwitcher } from '@/components/ui/language-switcher';

export function Navbar() {
  const t = useTranslations('navigation');
  const tCommon = useTranslations('common');
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: '/learn/hub', label: t('learn'), icon: Target },
    { href: '/learn/german', label: t('learn'), icon: BookOpen },
    { href: '/practice/flashcard', label: t('practice'), icon: Brain },
    { href: '/quiz', label: t('practice'), icon: Trophy },
    { href: '/dashboard/leaderboard', label: t('leaderboard'), icon: Users },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-4 left-4 right-4 z-50"
    >
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg shadow-indigo-500/10 border border-white/20 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-indigo-500/50 transition-shadow duration-300">
                <span className="text-white font-bold text-lg">DE</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-xl text-indigo-900 font-[family-name:var(--font-outfit)]">
                  {tCommon('appName')}
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-4 py-2 text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50 rounded-xl transition-all duration-200 font-medium"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </div>

            {/* CTA Buttons + Language Switcher */}
            <div className="hidden md:flex items-center gap-3">
              <LanguageSwitcher />
              <Link
                href="/auth/login"
                className="px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
              >
                {tCommon('login')}
              </Link>
              <Link
                href="/auth/login"
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 flex items-center gap-2"
              >
                {tCommon('signup')}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden overflow-hidden"
              >
                <div className="pt-4 pb-2 space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-3 px-4 py-3 text-indigo-700 hover:bg-indigo-50 rounded-xl transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <link.icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  ))}
                  <div className="pt-2 space-y-2">
                    <div className="px-4">
                      <LanguageSwitcher />
                    </div>
                    <Link
                      href="/auth/login"
                      className="block w-full text-center px-4 py-3 text-indigo-600 border border-indigo-200 rounded-xl font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      {tCommon('login')}
                    </Link>
                    <Link
                      href="/auth/login"
                      className="block w-full text-center px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold"
                      onClick={() => setIsOpen(false)}
                    >
                      {tCommon('signup')}
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
}
