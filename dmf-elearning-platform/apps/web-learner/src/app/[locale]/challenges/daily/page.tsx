'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Trophy,
  Timer,
  Flame,
  Award,
  Calendar,
  Target,
  Zap,
  TrendingUp,
  Star,
  Clock,
  RefreshCw,
} from 'lucide-react';
import {
  useDailyChallenge,
  useChallengeHistory,
  useStreakInfo,
  useLeaderboard,
} from '@/hooks/useChallengeQueries';
import { SkeletonCard, SkeletonStats, CountUp, ThemeToggle } from '@/components/ui';
import {
  ChallengeCard,
  ChallengeTimer,
  StreakTracker,
  LeaderboardPreview,
  ChallengeHistory,
  RewardsPanel,
} from '@/components/challenges';

export default function DailyChallengesPage() {
  const [showHistory, setShowHistory] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // React Query hooks
  const {
    data: challenge,
    isLoading: challengeLoading,
    error: challengeError,
    refetch: refetchChallenge,
  } = useDailyChallenge();

  const {
    data: history = [],
    isLoading: historyLoading,
  } = useChallengeHistory({ limit: 10 });

  const {
    data: streakInfo,
    isLoading: streakLoading,
  } = useStreakInfo();

  const {
    data: leaderboard = [],
    isLoading: leaderboardLoading,
  } = useLeaderboard({ limit: 10 });

  const isLoading = challengeLoading;
  const error = challengeError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-amber-500" />
                  Daily Challenges
                </h1>
                <p className="text-sm text-gray-600">Test your German skills daily</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SkeletonStats className="mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SkeletonCard className="h-96" />
            </div>
            <div className="space-y-4">
              <SkeletonCard className="h-48" />
              <SkeletonCard className="h-48" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Connection Error</h2>
          <p className="text-red-600 mb-4">Failed to load challenge. Please try again.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => refetchChallenge()}
              className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition cursor-pointer"
            >
              Try Again
            </button>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-amber-500" />
                  Daily Challenges
                </h1>
                <p className="text-sm text-gray-600">Test your German skills daily</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => refetchChallenge()}
                className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {streakInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <StatCard
              icon={<Flame className="w-5 h-5" />}
              label="Current Streak"
              value={streakInfo.currentStreak}
              suffix="days"
              color="orange"
              highlight={streakInfo.currentStreak > 0}
            />
            <StatCard
              icon={<Trophy className="w-5 h-5" />}
              label="Best Streak"
              value={streakInfo.longestStreak}
              suffix="days"
              color="amber"
            />
            <StatCard
              icon={<Star className="w-5 h-5" />}
              label="Total Completed"
              value={streakInfo.totalCompleted}
              color="yellow"
            />
            <StatCard
              icon={<Award className="w-5 h-5" />}
              label="Total Points"
              value={streakInfo.totalPoints}
              color="purple"
            />
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Challenge Card - Main Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {challenge && (
              <>
                <ChallengeCard challenge={challenge} />
                
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-amber-300 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-5 h-5 text-gray-700" />
                    <span className="font-medium text-gray-900">History</span>
                  </button>
                  <button
                    onClick={() => setShowLeaderboard(!showLeaderboard)}
                    className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-amber-300 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <TrendingUp className="w-5 h-5 text-gray-700" />
                    <span className="font-medium text-gray-900">Leaderboard</span>
                  </button>
                </div>
              </>
            )}

            {/* Challenge History Modal */}
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ChallengeHistory
                    history={history}
                    isLoading={historyLoading}
                    onClose={() => setShowHistory(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Leaderboard Modal */}
            <AnimatePresence>
              {showLeaderboard && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <LeaderboardPreview
                    leaderboard={leaderboard}
                    isLoading={leaderboardLoading}
                    onClose={() => setShowLeaderboard(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Timer */}
            {challenge && <ChallengeTimer expiresAt={challenge.expiresAt} />}

            {/* Streak Tracker */}
            {streakInfo && <StreakTracker streakInfo={streakInfo} />}

            {/* Rewards Panel */}
            {challenge && <RewardsPanel challenge={challenge} />}

            {/* Mini Leaderboard */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                Top Players Today
              </h3>
              {leaderboardLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : leaderboard.length > 0 ? (
                <div className="space-y-2">
                  {leaderboard.slice(0, 3).map((entry, idx) => (
                    <div
                      key={entry.userId}
                      className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx === 0
                            ? 'bg-yellow-400 text-yellow-900'
                            : idx === 1
                            ? 'bg-gray-300 text-gray-700'
                            : 'bg-orange-300 text-orange-900'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {entry.userName}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-amber-600">
                        {entry.score}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No entries yet
                </p>
              )}
              <button
                onClick={() => setShowLeaderboard(true)}
                className="w-full mt-3 py-2 text-sm font-medium text-amber-600 hover:text-amber-700 transition cursor-pointer"
              >
                View Full Leaderboard
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Components
// ═══════════════════════════════════════════════════════════════

function StatCard({
  icon,
  label,
  value,
  suffix,
  color,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  color: string;
  highlight?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-xl ${colorClasses[color]} ${
        highlight ? 'border-2 ring-2 ring-offset-2 ring-orange-300' : 'border'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs font-medium opacity-80">{label}</span>
      </div>
      <p className="text-2xl font-bold">
        <CountUp end={value} />
        {suffix && <span className="text-sm ml-1">{suffix}</span>}
      </p>
    </motion.div>
  );
}
