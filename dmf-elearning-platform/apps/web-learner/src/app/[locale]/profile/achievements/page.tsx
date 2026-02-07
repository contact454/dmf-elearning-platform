'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Trophy,
  Star,
  Lock,
  Share2,
  Filter,
  BookOpen,
  Users,
  Target,
  Zap,
  Award,
  Crown,
  Sparkles,
  TrendingUp,
  Flame,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';
import { ThemeToggle, CountUp } from '@/components/ui';
import { ShareAchievement, AchievementProgressBar } from '@/components/achievements';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

type AchievementCategory = 'all' | 'learning' | 'social' | 'milestones';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'learning' | 'social' | 'milestones';
  icon: React.ElementType;
  unlocked: boolean;
  progress: number; // 0-100
  total: number; // e.g., 100 words learned
  current: number; // e.g., 75 words learned
  unlockedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
}

// ═══════════════════════════════════════════════════════════════
// Mock Data
// ═══════════════════════════════════════════════════════════════

const mockAchievements: Achievement[] = [
  // Learning Achievements
  {
    id: 'vocab-master-100',
    title: 'Vocabulary Master',
    description: 'Learn 100 new German words',
    category: 'learning',
    icon: BookOpen,
    unlocked: true,
    progress: 100,
    total: 100,
    current: 100,
    unlockedAt: '2026-02-03T10:30:00',
    rarity: 'rare',
    xpReward: 500,
  },
  {
    id: 'reading-streak-7',
    title: 'Consistent Reader',
    description: 'Complete reading practice 7 days in a row',
    category: 'learning',
    icon: Flame,
    unlocked: true,
    progress: 100,
    total: 7,
    current: 7,
    unlockedAt: '2026-02-04T18:20:00',
    rarity: 'epic',
    xpReward: 1000,
  },
  {
    id: 'grammar-quiz-perfect',
    title: 'Grammar Guru',
    description: 'Score 100% on a grammar quiz',
    category: 'learning',
    icon: Award,
    unlocked: true,
    progress: 100,
    total: 1,
    current: 1,
    unlockedAt: '2026-02-01T14:15:00',
    rarity: 'epic',
    xpReward: 800,
  },
  {
    id: 'listening-hours-10',
    title: 'Listening Champion',
    description: 'Complete 10 hours of listening practice',
    category: 'learning',
    icon: Star,
    unlocked: false,
    progress: 65,
    total: 10,
    current: 6.5,
    rarity: 'rare',
    xpReward: 600,
  },
  {
    id: 'speaking-sessions-50',
    title: 'Conversation Expert',
    description: 'Complete 50 speaking practice sessions',
    category: 'learning',
    icon: MessageSquare,
    unlocked: false,
    progress: 42,
    total: 50,
    current: 21,
    rarity: 'epic',
    xpReward: 1200,
  },
  {
    id: 'vocab-1000',
    title: 'Word Collector',
    description: 'Learn 1000 German words',
    category: 'learning',
    icon: Trophy,
    unlocked: false,
    progress: 35,
    total: 1000,
    current: 350,
    rarity: 'legendary',
    xpReward: 5000,
  },

  // Social Achievements
  {
    id: 'friend-5',
    title: 'Social Learner',
    description: 'Add 5 learning partners',
    category: 'social',
    icon: Users,
    unlocked: true,
    progress: 100,
    total: 5,
    current: 5,
    unlockedAt: '2026-01-28T12:00:00',
    rarity: 'common',
    xpReward: 200,
  },
  {
    id: 'share-achievement-1',
    title: 'First Share',
    description: 'Share your first achievement',
    category: 'social',
    icon: Share2,
    unlocked: true,
    progress: 100,
    total: 1,
    current: 1,
    unlockedAt: '2026-02-03T16:45:00',
    rarity: 'common',
    xpReward: 100,
  },
  {
    id: 'leaderboard-top10',
    title: 'Top Performer',
    description: 'Reach top 10 on the leaderboard',
    category: 'social',
    icon: Crown,
    unlocked: false,
    progress: 60,
    total: 10,
    current: 16,
    rarity: 'epic',
    xpReward: 1500,
  },
  {
    id: 'community-helper',
    title: 'Community Helper',
    description: 'Help 10 other learners',
    category: 'social',
    icon: Sparkles,
    unlocked: false,
    progress: 30,
    total: 10,
    current: 3,
    rarity: 'rare',
    xpReward: 700,
  },

  // Milestones
  {
    id: 'first-lesson',
    title: 'First Step',
    description: 'Complete your first lesson',
    category: 'milestones',
    icon: CheckCircle2,
    unlocked: true,
    progress: 100,
    total: 1,
    current: 1,
    unlockedAt: '2026-01-20T09:00:00',
    rarity: 'common',
    xpReward: 50,
  },
  {
    id: 'level-up-a2',
    title: 'Level Up!',
    description: 'Reach A2 German proficiency',
    category: 'milestones',
    icon: TrendingUp,
    unlocked: true,
    progress: 100,
    total: 1,
    current: 1,
    unlockedAt: '2026-02-05T11:30:00',
    rarity: 'epic',
    xpReward: 2000,
  },
  {
    id: 'study-time-100h',
    title: 'Dedicated Student',
    description: 'Study for 100 total hours',
    category: 'milestones',
    icon: Target,
    unlocked: false,
    progress: 48,
    total: 100,
    current: 48,
    rarity: 'legendary',
    xpReward: 3000,
  },
  {
    id: 'daily-goal-30',
    title: 'Consistency King',
    description: 'Complete daily goal 30 days in a row',
    category: 'milestones',
    icon: Zap,
    unlocked: false,
    progress: 73,
    total: 30,
    current: 22,
    rarity: 'epic',
    xpReward: 1800,
  },
];

// ═══════════════════════════════════════════════════════════════
// Rarity Colors
// ═══════════════════════════════════════════════════════════════

const rarityColors = {
  common: {
    bg: 'from-gray-400 to-gray-500',
    border: 'border-gray-400',
    glow: 'shadow-gray-400/50',
    text: 'text-gray-700',
  },
  rare: {
    bg: 'from-blue-400 to-blue-600',
    border: 'border-blue-400',
    glow: 'shadow-blue-400/50',
    text: 'text-blue-700',
  },
  epic: {
    bg: 'from-purple-400 to-purple-600',
    border: 'border-purple-400',
    glow: 'shadow-purple-400/50',
    text: 'text-purple-700',
  },
  legendary: {
    bg: 'from-amber-400 via-orange-500 to-amber-600',
    border: 'border-amber-400',
    glow: 'shadow-amber-400/50',
    text: 'text-amber-700',
  },
};

// ═══════════════════════════════════════════════════════════════
// Achievement Card Component
// ═══════════════════════════════════════════════════════════════

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const [isHovered, setIsHovered] = useState(false);

  const Icon = achievement.icon;
  const rarity = rarityColors[achievement.rarity];

  return (
    <motion.div
      className={`relative bg-white rounded-2xl border-2 overflow-hidden ${
        achievement.unlocked
          ? `${rarity.border} shadow-lg ${isHovered ? rarity.glow : ''}`
          : 'border-gray-200'
      } transition-all duration-300`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Rarity Gradient Header */}
      {achievement.unlocked && (
        <div className={`h-2 bg-gradient-to-r ${rarity.bg}`} />
      )}

      <div className="p-6">
        {/* Icon & Lock State */}
        <div className="flex items-start justify-between mb-4">
          <div
            className={`p-4 rounded-xl ${
              achievement.unlocked
                ? `bg-gradient-to-br ${rarity.bg} shadow-lg`
                : 'bg-gray-200'
            } transition-all duration-300`}
          >
            {achievement.unlocked ? (
              <Icon className="w-8 h-8 text-white" />
            ) : (
              <Lock className="w-8 h-8 text-gray-400" />
            )}
          </div>

          {achievement.unlocked && (
            <ShareAchievement
              achievementTitle={achievement.title}
              achievementDescription={achievement.description}
              rarity={achievement.rarity}
              xpReward={achievement.xpReward}
            />
          )}
        </div>

        {/* Title & Description */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={`font-bold text-lg ${
                achievement.unlocked ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {achievement.title}
            </h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                achievement.unlocked
                  ? `${rarity.text} bg-gradient-to-r ${rarity.bg} bg-opacity-10`
                  : 'text-gray-400 bg-gray-100'
              }`}
            >
              {achievement.rarity}
            </span>
          </div>
          <p
            className={`text-sm ${
              achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
            }`}
          >
            {achievement.description}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <AchievementProgressBar
            progress={achievement.progress}
            current={achievement.current}
            total={achievement.total}
            rarity={achievement.rarity}
            animated={true}
          />
        </div>

        {/* Reward & Unlock Date */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-amber-600">
            <Zap className="w-3 h-3" />
            <span className="font-semibold">+{achievement.xpReward} XP</span>
          </div>
          {achievement.unlockedAt && (
            <span className="text-gray-500">
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Unlock Celebration (when unlocked) */}
      {achievement.unlocked && isHovered && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-amber-400 rounded-full"
              style={{
                top: '50%',
                left: '50%',
              }}
              animate={{
                x: [0, (Math.random() - 0.5) * 100],
                y: [0, (Math.random() - 0.5) * 100],
                opacity: [1, 0],
                scale: [1, 0],
              }}
              transition={{
                duration: 0.8,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════

export default function AchievementsPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<AchievementCategory>('all');

  const categories = [
    { id: 'all' as const, label: 'All', icon: Trophy },
    { id: 'learning' as const, label: 'Learning', icon: BookOpen },
    { id: 'social' as const, label: 'Social', icon: Users },
    { id: 'milestones' as const, label: 'Milestones', icon: Target },
  ];

  const filteredAchievements = useMemo(() => {
    if (selectedCategory === 'all') return mockAchievements;
    return mockAchievements.filter((a) => a.category === selectedCategory);
  }, [selectedCategory]);

  const stats = useMemo(() => {
    const unlocked = mockAchievements.filter((a) => a.unlocked).length;
    const total = mockAchievements.length;
    const totalXP = mockAchievements
      .filter((a) => a.unlocked)
      .reduce((sum, a) => sum + a.xpReward, 0);

    return {
      unlocked,
      total,
      percentage: Math.round((unlocked / total) * 100),
      totalXP,
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/profile"
                className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-amber-500" />
                  Achievements
                </h1>
                <p className="text-sm text-gray-600">
                  Track your learning journey
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            className="bg-white rounded-2xl p-6 border-2 border-amber-200 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Unlocked</p>
                <p className="text-3xl font-bold text-gray-900">
                  <CountUp end={stats.unlocked} duration={1} />
                  <span className="text-lg text-gray-500">/{stats.total}</span>
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl p-6 border-2 border-emerald-200 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completion</p>
                <p className="text-3xl font-bold text-gray-900">
                  <CountUp end={stats.percentage} duration={1} />%
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl p-6 border-2 border-purple-200 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total XP</p>
                <p className="text-3xl font-bold text-gray-900">
                  <CountUp end={stats.totalXP} duration={1} />
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
            return (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-amber-300'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-5 h-5" />
                {category.label}
              </motion.button>
            );
          })}
        </div>

        {/* Achievement Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          layout
        >
          <AnimatePresence mode="popLayout">
            {filteredAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredAchievements.length === 0 && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="inline-block p-8 bg-gray-100 rounded-full mb-4">
              <Filter className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No achievements found
            </h3>
            <p className="text-gray-600">
              Try selecting a different category
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
