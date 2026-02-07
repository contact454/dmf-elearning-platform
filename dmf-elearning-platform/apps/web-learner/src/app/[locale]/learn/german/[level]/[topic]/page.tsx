'use client';

import { use, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Target,
  Zap,
  Clock,
  Trophy,
  RotateCcw,
  Brain,
  TrendingUp,
  Calendar,
  Flame,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SRSFlashcardDeck } from '@/components/flashcard/SRSFlashcardDeck';
import { useVocabulary, useUserProgress, useSubmitReview } from '@/hooks/useApiQueries';
import { useUser } from '@/providers/user-provider';
import { PageTransition, AnimateOnScroll, LiftCard, AnimatedCounter, SkeletonTransition } from '@/components/ui/animations';
import { formatTopicName, getLevelDisplayName, type UserProgressStats } from '@/services/german-api';
import { cn } from '@/lib/utils';

interface VocabularyPageProps {
  params: Promise<{
    level: string;
    topic: string;
  }>;
}

export default function VocabularyPracticePage({ params }: VocabularyPageProps) {
  const { level, topic } = use(params);
  const router = useRouter();
  const { userId } = useUser();

  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState<UserProgressStats | null>(null);

  // Fetch vocabulary data and user progress
  const { data: vocabularyData, isLoading: vocabLoading, error: vocabError } = useVocabulary(level, topic);
  const { data: userProgress, isLoading: progressLoading } = useUserProgress();

  const isLoading = vocabLoading || progressLoading;

  const handleSessionComplete = (stats: UserProgressStats) => {
    setSessionStats(stats);
    setSessionComplete(true);
  };

  const handleRestartSession = () => {
    setSessionComplete(false);
    setSessionStats(null);
  };

  const handleBackToTopics = () => {
    router.push('/learn/german');
  };

  return (
    <PageTransition variant="fadeUp">
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBackToTopics}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors group"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-indigo-600" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {formatTopicName(topic)}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {getLevelDisplayName(level)} · SRS Practice
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              {userProgress && (
                <div className="hidden md:flex items-center gap-3">
                  <StatBadge
                    icon={<Flame className="w-4 h-4" />}
                    label={`${userProgress.streak} day streak`}
                    color="orange"
                  />
                  <StatBadge
                    icon={<Trophy className="w-4 h-4" />}
                    label={`${userProgress.masteredCards} mastered`}
                    color="green"
                  />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SkeletonTransition
            isLoading={isLoading}
            skeleton={<LoadingSkeleton />}
          >
            {vocabError ? (
              <ErrorState error={vocabError} onBack={handleBackToTopics} />
            ) : sessionComplete && sessionStats ? (
              <SessionCompletedState
                stats={sessionStats}
                vocabularyData={vocabularyData}
                onRestart={handleRestartSession}
                onBackToTopics={handleBackToTopics}
              />
            ) : (
              <div className="grid lg:grid-cols-12 gap-8">
                {/* Main Practice Area */}
                <div className="lg:col-span-8">
                  <AnimateOnScroll variant="fadeUp">
                    <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 sm:p-8">
                      <SRSFlashcardDeck
                        userId={userId}
                        level={level}
                        onComplete={handleSessionComplete}
                        showProgress={true}
                      />
                    </div>
                  </AnimateOnScroll>
                </div>

                {/* Progress Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                  {userProgress && (
                    <>
                      <AnimateOnScroll variant="fadeRight" delay={0.1}>
                        <ProgressOverviewCard progress={userProgress} />
                      </AnimateOnScroll>

                      <AnimateOnScroll variant="fadeRight" delay={0.2}>
                        <TopicInfoCard
                          topic={topic}
                          level={level}
                          vocabularyCount={vocabularyData?.count || 0}
                        />
                      </AnimateOnScroll>

                      <AnimateOnScroll variant="fadeRight" delay={0.3}>
                        <LearningTipsCard />
                      </AnimateOnScroll>
                    </>
                  )}
                </div>
              </div>
            )}
          </SkeletonTransition>
        </main>
      </div>
    </PageTransition>
  );
}

// ═══════════════════════════════════════════════════════════════
// Component: Progress Overview Card
// ═══════════════════════════════════════════════════════════════

function ProgressOverviewCard({ progress }: { progress: UserProgressStats }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Brain className="w-5 h-5 text-indigo-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Your Progress</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ProgressStatCard
          icon={<Zap className="w-5 h-5" />}
          label="Mastered"
          value={progress.masteredCards}
          color="green"
          trend={progress.masteredCards > 0 ? '+12%' : undefined}
        />
        <ProgressStatCard
          icon={<Clock className="w-5 h-5" />}
          label="Learning"
          value={progress.learningCards}
          color="blue"
        />
        <ProgressStatCard
          icon={<RotateCcw className="w-5 h-5" />}
          label="Review"
          value={progress.reviewCards}
          color="yellow"
        />
        <ProgressStatCard
          icon={<Flame className="w-5 h-5" />}
          label="Streak"
          value={progress.streak}
          suffix=" days"
          color="orange"
        />
      </div>

      {/* Total Progress */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Total Cards</span>
          <span className="text-sm font-bold text-gray-900">
            <AnimatedCounter value={progress.totalCards} />
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(progress.masteredCards / Math.max(progress.totalCards, 1)) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          <AnimatedCounter value={Math.round((progress.masteredCards / Math.max(progress.totalCards, 1)) * 100)} />% mastered
        </p>
      </div>
    </div>
  );
}

function ProgressStatCard({
  icon,
  label,
  value,
  suffix = '',
  color,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  color: 'green' | 'blue' | 'yellow' | 'orange';
  trend?: string;
}) {
  const colorClasses = {
    green: 'bg-green-50 border-green-200 text-green-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
  };

  return (
    <div className={cn('p-4 rounded-xl border-2', colorClasses[color])}>
      <div className="flex items-center justify-between mb-2">
        {icon}
        {trend && (
          <span className="text-xs font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold">
        <AnimatedCounter value={value} suffix={suffix} />
      </p>
      <p className="text-xs opacity-80 mt-1">{label}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Component: Topic Info Card
// ═══════════════════════════════════════════════════════════════

function TopicInfoCard({
  topic,
  level,
  vocabularyCount,
}: {
  topic: string;
  level: string;
  vocabularyCount: number;
}) {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Target className="w-5 h-5 text-purple-600" />
        </div>
        <h3 className="text-lg font-bold text-purple-900">Topic Details</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-purple-700">Level</span>
          <span className="px-3 py-1 bg-purple-100 rounded-full text-sm font-medium text-purple-900">
            {getLevelDisplayName(level)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-purple-700">Topic</span>
          <span className="text-sm font-medium text-purple-900">{formatTopicName(topic)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-purple-700">Vocabulary</span>
          <span className="text-sm font-bold text-purple-900">
            <AnimatedCounter value={vocabularyCount} /> words
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Component: Learning Tips Card
// ═══════════════════════════════════════════════════════════════

function LearningTipsCard() {
  const tips = [
    'Use keyboard shortcuts (1-4) for faster reviews',
    'Study consistently for better retention',
    'Focus on difficult cards first',
    'Review regularly to maintain your streak',
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Zap className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-bold text-blue-900">Learning Tips</h3>
      </div>

      <ul className="space-y-2">
        {tips.map((tip, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-2 text-sm text-blue-700"
          >
            <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{tip}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Component: Session Completed State
// ═══════════════════════════════════════════════════════════════

function SessionCompletedState({
  stats,
  vocabularyData,
  onRestart,
  onBackToTopics,
}: {
  stats: UserProgressStats;
  vocabularyData: any;
  onRestart: () => void;
  onBackToTopics: () => void;
}) {
  return (
    <AnimateOnScroll variant="scale">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-3xl border-2 border-indigo-200 p-8 sm:p-12 text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-indigo-500 rounded-full mb-6"
          >
            <Trophy className="w-10 h-10 text-white" />
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-indigo-900 mb-3"
          >
            Session Complete!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-indigo-700 mb-8"
          >
            Great work on {formatTopicName(vocabularyData?.topic || '')}
          </motion.p>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
          >
            <CompletionStatCard
              icon={<Zap />}
              label="Mastered"
              value={stats.masteredCards}
              color="green"
            />
            <CompletionStatCard
              icon={<Clock />}
              label="Learning"
              value={stats.learningCards}
              color="blue"
            />
            <CompletionStatCard
              icon={<Flame />}
              label="Streak"
              value={stats.streak}
              suffix=" days"
              color="orange"
            />
            <CompletionStatCard
              icon={<Trophy />}
              label="Total"
              value={stats.totalCards}
              color="purple"
            />
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={onRestart}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Practice Again
            </button>
            <button
              onClick={onBackToTopics}
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 text-indigo-600 border-2 border-indigo-200 rounded-xl font-medium transition-all"
            >
              Back to Topics
            </button>
          </motion.div>
        </div>
      </div>
    </AnimateOnScroll>
  );
}

function CompletionStatCard({
  icon,
  label,
  value,
  suffix = '',
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  color: 'green' | 'blue' | 'orange' | 'purple';
}) {
  const colorClasses = {
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    orange: 'bg-orange-100 text-orange-700',
    purple: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
      <div className={cn('inline-flex p-2 rounded-lg mb-2', colorClasses[color])}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">
        <AnimatedCounter value={value} suffix={suffix} />
      </p>
      <p className="text-xs text-gray-600 mt-1">{label}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Component: Loading Skeleton
// ═══════════════════════════════════════════════════════════════

function LoadingSkeleton() {
  return (
    <div className="grid lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
          <div className="w-full h-96 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </div>
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Component: Error State
// ═══════════════════════════════════════════════════════════════

function ErrorState({ error, onBack }: { error: any; onBack: () => void }) {
  return (
    <div className="max-w-md mx-auto">
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">⚠️</span>
        </div>
        <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Content</h2>
        <p className="text-red-600 mb-6">
          {error?.message || 'Failed to load vocabulary data'}
        </p>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
        >
          Back to Topics
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Helper Component: Stat Badge
// ═══════════════════════════════════════════════════════════════

function StatBadge({
  icon,
  label,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  color: 'orange' | 'green';
}) {
  const colorClasses = {
    orange: 'bg-orange-100 text-orange-700',
    green: 'bg-green-100 text-green-700',
  };

  return (
    <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg', colorClasses[color])}>
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
