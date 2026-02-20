'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  BookOpen,
  Headphones,
  Mic,
  PenTool,
  Brain,
  Target,
  Clock,
  Calendar,
  Award,
  ChevronRight,
  Sparkles,
  Flame,
  Star,
  Zap,
  Trophy,
  BarChart3,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { HubData } from '@/services/german-api';
import { useHubData, useUpdateDailyGoals } from '@/hooks/useApiQueries';
import {
  SkeletonCard,
  SkeletonStats,
  ProgressBar,
  CountUp,
  StreakFlame,
  ThemeToggle,
  StaggeredList,
  StaggeredItem,
  AnimateOnScroll,
  LiftCard,
} from '@/components/ui';

// ═══════════════════════════════════════════════════════════════
// Skill Configuration
// ═══════════════════════════════════════════════════════════════

const skillConfig = {
  vocabulary: {
    name: 'Vocabulary Master',
    nameVi: 'Kho Từ Vựng',
    icon: Brain,
    color: 'indigo',
    gradient: 'from-indigo-500 to-purple-600',
    bgLight: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    link: '/learn/german',
    description: 'Learn German words with SRS',
  },
  reading: {
    name: 'Smart Library',
    nameVi: 'Thư Viện Thông Minh',
    icon: BookOpen,
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    link: '/learn/reading',
    description: 'Read at your level with i+1',
  },
  listening: {
    name: 'Listening Lab',
    nameVi: 'Phòng Nghe',
    icon: Headphones,
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-600',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-600',
    link: '/learn/listening',
    description: 'Train your ear with dictation',
  },
  speaking: {
    name: 'Speaking Studio',
    nameVi: 'Phòng Thu Âm',
    icon: Mic,
    color: 'rose',
    gradient: 'from-rose-500 to-pink-600',
    bgLight: 'bg-rose-50',
    textColor: 'text-rose-600',
    link: '/learn/speaking',
    description: 'Practice pronunciation',
  },
  writing: {
    name: 'Writing Workshop',
    nameVi: 'Xưởng Viết',
    icon: PenTool,
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
    link: '/learn/writing',
    description: 'Write with AI feedback',
  },
};

type GoalType = 'vocabulary' | 'reading' | 'listening';

const DEFAULT_GOAL_DRAFT: Record<GoalType, number> = {
  vocabulary: 10,
  reading: 1,
  listening: 1,
};

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════

export default function LearningHubPage() {
  const { data, isLoading, error, refetch, isFetching } = useHubData();
  const updateDailyGoalsMutation = useUpdateDailyGoals();
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [goalDraft, setGoalDraft] = useState<Record<GoalType, number>>(DEFAULT_GOAL_DRAFT);

  useEffect(() => {
    if (!data) {
      return;
    }

    const nextDraft = { ...DEFAULT_GOAL_DRAFT };
    for (const goal of data.dailyGoals) {
      nextDraft[goal.type] = goal.target;
    }
    setGoalDraft(nextDraft);
  }, [data]);

  const handleGoalTargetChange = (type: GoalType, value: string) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      return;
    }
    setGoalDraft((prev) => ({
      ...prev,
      [type]: Math.max(1, Math.min(200, parsed)),
    }));
  };

  const handleCancelGoalsEdit = () => {
    if (data) {
      const resetDraft = { ...DEFAULT_GOAL_DRAFT };
      for (const goal of data.dailyGoals) {
        resetDraft[goal.type] = goal.target;
      }
      setGoalDraft(resetDraft);
    }
    setIsEditingGoals(false);
  };

  const handleSaveGoals = async () => {
    await updateDailyGoalsMutation.mutateAsync(goalDraft);
    setIsEditingGoals(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        {/* Header Skeleton */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Learning Hub</h1>
                  <p className="text-sm text-gray-600">Your German learning journey</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Skeleton */}
          <SkeletonStats className="mb-8" />

          {/* Daily Progress Skeleton */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-semibold text-gray-900">Today&apos;s Goals</h2>
            </div>
            <ProgressBar value={0} max={100} variant="gradient" className="mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonCard key={i} className="!p-4" />
              ))}
            </div>
          </div>

          {/* Skills Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonCard key={i} className="!p-0">
                <div className="h-24 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded-t-2xl" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
                  <div className="h-2 bg-gray-200 rounded w-full animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                </div>
              </SkeletonCard>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center">
          <h1 className="text-xl font-semibold text-red-700 mb-2">Hub unavailable</h1>
          <p className="text-sm text-slate-600 mb-4">
            {error instanceof Error
              ? error.message
              : 'Could not load learning hub data from backend.'}
          </p>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalDailyProgress = data.dailyGoals.reduce((acc, goal) => acc + goal.completed, 0);
  const totalDailyTarget = data.dailyGoals.reduce(
    (acc, goal) => acc + (isEditingGoals ? goalDraft[goal.type] : goal.target),
    0
  );
  const dailyProgressPercent = Math.round((totalDailyProgress / totalDailyTarget) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Learning Hub</h1>
                <p className="text-sm text-gray-600">Your German learning journey</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${isFetching ? 'animate-spin' : ''}`} />
              </button>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
          >
            <Sparkles className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Connection Error</p>
              <p className="text-xs text-red-600 mt-1">
                Failed to connect to the Learning Service. Please check if it's running.
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* Stats Overview */}
        <StaggeredList className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StaggeredItem>
            <StatsCard
              icon={<Star className="w-5 h-5" />}
              label="Level"
              value={data.overallLevel}
              color="purple"
            />
          </StaggeredItem>
          <StaggeredItem>
            <StatsCard
              icon={<Zap className="w-5 h-5" />}
              label="Total XP"
              value={<CountUp end={data.totalXP} />}
              color="amber"
            />
          </StaggeredItem>
          <StaggeredItem>
            <div className="p-4 rounded-xl bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-5 h-5" />
                <span className="text-xs font-medium opacity-80">Current Streak</span>
              </div>
              <div className="flex items-center gap-2">
                <StreakFlame streak={data.currentStreak} size="sm" />
                <span className="text-2xl font-bold">{data.currentStreak} days</span>
              </div>
            </div>
          </StaggeredItem>
          <StaggeredItem>
            <StatsCard
              icon={<Trophy className="w-5 h-5" />}
              label="Best Streak"
              value={`${data.longestStreak} days`}
              color="blue"
            />
          </StaggeredItem>
        </StaggeredList>

        {/* Daily Progress */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-semibold text-gray-900">Today's Goals</h2>
            </div>
            <div className="flex items-center gap-2">
              {isEditingGoals ? (
                <>
                  <button
                    onClick={handleCancelGoalsEdit}
                    disabled={updateDailyGoalsMutation.isPending}
                    className="px-3 py-1 text-xs rounded border border-gray-200 hover:bg-gray-100 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveGoals}
                    disabled={updateDailyGoalsMutation.isPending}
                    className="px-3 py-1 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {updateDailyGoalsMutation.isPending ? 'Saving...' : 'Save goals'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditingGoals(true)}
                  className="px-3 py-1 text-xs rounded border border-gray-200 hover:bg-gray-100"
                >
                  Edit goals
                </button>
              )}
              <div className="text-sm font-medium text-gray-600">{dailyProgressPercent}% Complete</div>
            </div>
          </div>

          {/* Progress Bar */}
          <ProgressBar
            value={dailyProgressPercent}
            max={100}
            variant="gradient"
            size="md"
            className="mb-6"
          />

          {/* Daily Goals Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {data.dailyGoals.map((goal) => {
              const config = skillConfig[goal.type];
              const Icon = config.icon;
              const target = isEditingGoals ? goalDraft[goal.type] : goal.target;
              const percent = Math.min(100, Math.round((goal.completed / Math.max(target, 1)) * 100));
              const isComplete = goal.isCompleted || goal.completed >= target;
              const cardClassName = `p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                isComplete
                  ? 'bg-green-50 border-green-200'
                  : `${config.bgLight} border-transparent`
              }`;
              const cardContent = (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${isComplete ? 'text-green-600' : config.textColor}`} />
                    <span className="text-xs font-medium text-gray-600 capitalize">{goal.type}</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {goal.completed}/{target}
                  </div>
                  <div className="text-xs text-gray-500">{goal.unit}</div>
                  {isEditingGoals && (
                    <div className="mt-2">
                      <label className="text-[11px] text-gray-500 block mb-1">Target</label>
                      <input
                        type="number"
                        min={1}
                        max={200}
                        value={goalDraft[goal.type]}
                        onChange={(event) => handleGoalTargetChange(goal.type, event.target.value)}
                        className="w-full rounded border border-gray-200 px-2 py-1 text-sm"
                      />
                    </div>
                  )}
                  <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isComplete ? 'bg-green-500' : 'bg-' + config.color + '-500'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </>
              );

              if (isEditingGoals) {
                return (
                  <div key={goal.type} className={cardClassName}>
                    {cardContent}
                  </div>
                );
              }

              return (
                <Link key={goal.type} href={config.link} className={cardClassName}>
                  {cardContent}
                </Link>
              );
            })}
          </div>
          {updateDailyGoalsMutation.isError && (
            <p className="text-sm text-red-600 mt-3">
              Failed to update daily goals. Please try again.
            </p>
          )}
        </motion.section>

        {/* Recommended Activity */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Link href={data.recommendedActivity.link}>
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-sm font-medium text-indigo-100">Recommended for you</span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{data.recommendedActivity.title}</h3>
                  <p className="text-indigo-100">{data.recommendedActivity.reason}</p>
                </div>
                <div className="p-4 bg-white/20 rounded-xl">
                  <ArrowRight className="w-6 h-6" />
                </div>
              </div>
            </div>
          </Link>
        </motion.section>

        {/* Skills Grid */}
        <AnimateOnScroll variant="fadeUp" delay={0.2}>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Skills</h2>
          </div>

          <StaggeredList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" staggerDelay={0.08}>
            {data.skillProgress.map((skill) => {
              const config = skillConfig[skill.skill as keyof typeof skillConfig];
              const Icon = config.icon;

              return (
                <StaggeredItem key={skill.skill}>
                  <Link href={config.link}>
                    <LiftCard
                      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden group"
                      liftAmount={6}
                    >
                      {/* Header */}
                      <div className={`h-24 bg-gradient-to-br ${config.gradient} p-4 flex items-end`}>
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <h3 className="text-lg font-bold text-white">{config.name}</h3>
                            <p className="text-sm text-white/80">{config.nameVi}</p>
                          </div>
                          <div className="p-3 bg-white/20 rounded-xl group-hover:bg-white/30 transition">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        {/* Level Badge */}
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-2 py-1 ${config.bgLight} ${config.textColor} text-xs font-medium rounded-full`}>
                            Level {skill.level}
                          </span>
                          {skill.streak > 0 && (
                            <span className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                              <Flame className="w-3 h-3" />
                              {skill.streak} day streak
                            </span>
                          )}
                        </div>

                        {/* Progress */}
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Progress</span>
                            <span className="font-medium text-gray-900 dark:text-white">{skill.progress}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${skill.progress}%` }}
                              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                              className={`h-full bg-gradient-to-r ${config.gradient} rounded-full`}
                            />
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                          <span>{skill.itemsLearned}/{skill.itemsTotal} items</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {skill.lastPracticed
                              ? formatLastPracticed(skill.lastPracticed)
                              : 'Not started'}
                          </span>
                        </div>

                        {/* CTA */}
                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">{config.description}</span>
                            <ChevronRight className={`w-5 h-5 ${config.textColor} group-hover:translate-x-1 transition-transform`} />
                          </div>
                        </div>
                      </div>
                    </LiftCard>
                  </Link>
                </StaggeredItem>
              );
            })}
          </StaggeredList>
        </AnimateOnScroll>

        {/* Recent Achievements */}
        {data.recentAchievements.length > 0 && (
          <AnimateOnScroll variant="fadeUp" delay={0.3} className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Achievements</h2>
            </div>

            <StaggeredList className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide" staggerDelay={0.1}>
              {data.recentAchievements.map((achievement) => (
                <StaggeredItem key={achievement.id} className="flex-shrink-0">
                  <LiftCard className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 min-w-[200px]">
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{achievement.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  </LiftCard>
                </StaggeredItem>
              ))}
            </StaggeredList>
          </AnimateOnScroll>
        )}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Helper Components
// ═══════════════════════════════════════════════════════════════

function StatsCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    purple: 'bg-purple-50 text-purple-700',
    amber: 'bg-amber-50 text-amber-700',
    orange: 'bg-orange-50 text-orange-700',
    blue: 'bg-blue-50 text-blue-700',
  };

  return (
    <div className={`p-4 rounded-xl ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs font-medium opacity-80">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════

function formatLastPracticed(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
}
