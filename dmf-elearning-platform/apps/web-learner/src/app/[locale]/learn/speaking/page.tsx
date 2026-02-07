'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Mic,
  Clock,
  Target,
  TrendingUp,
  Sparkles,
  Filter,
  Search,
  Volume2,
  Trophy,
  RefreshCw,
} from 'lucide-react';
import { SpeakingPrompt } from '@/services/german-api';
import {
  useSpeakingPrompts,
  useFeaturedSpeaking,
  useSpeakingContentStats,
  useLevels,
} from '@/hooks/useApiQueries';
import { SkeletonCard, SkeletonStats, CountUp, ThemeToggle } from '@/components/ui';

export default function SpeakingStudioPage() {
  // Filters
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Build filters object for query
  const filters = useMemo(() => ({
    level: selectedLevel || undefined,
    category: selectedCategory || undefined,
    search: searchQuery || undefined,
    limit: 20,
  }), [selectedLevel, selectedCategory, searchQuery]);

  // React Query hooks
  const {
    data: promptsData,
    isLoading: promptsLoading,
    error: promptsError,
    refetch: refetchPrompts,
    isFetching: promptsFetching,
  } = useSpeakingPrompts(filters);

  const {
    data: featured = [],
  } = useFeaturedSpeaking(5);

  const {
    data: stats,
  } = useSpeakingContentStats();

  const {
    data: levels = [],
  } = useLevels();

  // Extract categories from stats
  const categories = stats?.byCategory?.map((c: { category: string }) => c.category) || [];

  const prompts = promptsData?.items || [];
  const isLoading = promptsLoading && prompts.length === 0;
  const error = promptsError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Link href="/learn/hub" className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Mic className="w-6 h-6 text-rose-500" />
                  Speaking Studio
                </h1>
                <p className="text-sm text-gray-600">Practice pronunciation and speaking</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Skeleton */}
          <SkeletonStats className="mb-8" />

          {/* Content Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} className="!p-0">
                <div className="h-24 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
                  <div className="h-5 bg-gray-200 rounded w-2/3 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                </div>
              </SkeletonCard>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Connection Error</h2>
          <p className="text-red-600 mb-4">Failed to load content. Is the Learning Service running?</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => refetchPrompts()}
              className="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition cursor-pointer"
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
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/learn/hub" className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Mic className="w-6 h-6 text-rose-500" />
                  Speaking Studio
                </h1>
                <p className="text-sm text-gray-600">Practice pronunciation and speaking</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => refetchPrompts()}
                disabled={promptsFetching}
                className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${promptsFetching ? 'animate-spin' : ''}`} />
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <StatCard
              icon={<Mic className="w-5 h-5" />}
              label="Total Prompts"
              value={stats.totalPrompts}
              color="rose"
            />
            <StatCard
              icon={<Target className="w-5 h-5" />}
              label="Levels"
              value={stats.byLevel.length}
              color="blue"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="Categories"
              value={stats.byCategory.length}
              color="purple"
            />
            <StatCard
              icon={<Trophy className="w-5 h-5" />}
              label="Practice Minutes"
              value={stats.totalPrompts * 2}
              color="orange"
            />
          </motion.div>
        )}

        {/* Featured Section */}
        {featured.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-gray-900">Featured Prompts</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((item) => (
                <PromptCard key={item.id} prompt={item} featured />
              ))}
            </div>
          </motion.section>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6"
        >
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
            </div>

            {/* Level Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedLevel('')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  selectedLevel === ''
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Levels
              </button>
              {levels.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    selectedLevel === level
                      ? 'bg-rose-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>

            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search prompts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && refetchPrompts()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Prompts Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Prompts</h2>
          {prompts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Mic className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No prompts found</h3>
              <p className="text-gray-600">Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prompts.map((item) => (
                <PromptCard key={item.id} prompt={item} />
              ))}
            </div>
          )}
        </motion.section>
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
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    rose: 'bg-rose-50 text-rose-700',
    blue: 'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
    orange: 'bg-orange-50 text-orange-700',
  };

  return (
    <div className={`p-4 rounded-xl ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs font-medium opacity-80">{label}</span>
      </div>
      <p className="text-2xl font-bold">
        <CountUp end={value} />
      </p>
    </div>
  );
}

function PromptCard({
  prompt,
  featured = false,
}: {
  prompt: SpeakingPrompt;
  featured?: boolean;
}) {
  const categoryIcons: Record<string, string> = {
    general: '💬',
    conversation: '🗣️',
    roleplay: '🎭',
    pronunciation: '🔤',
    reading: '📖',
  };

  return (
    <Link href={`/learn/speaking/${prompt.id}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`bg-white rounded-xl border overflow-hidden cursor-pointer transition-shadow hover:shadow-lg ${
          featured ? 'border-yellow-300 ring-2 ring-yellow-100' : 'border-gray-200'
        }`}
      >
        {/* Header */}
        <div
          className={`h-24 bg-gradient-to-br ${
            prompt.level === 'A1'
              ? 'from-green-400 to-emerald-500'
              : prompt.level === 'A2'
              ? 'from-teal-400 to-cyan-500'
              : prompt.level === 'B1'
              ? 'from-blue-400 to-indigo-500'
              : prompt.level === 'B2'
              ? 'from-purple-400 to-violet-500'
              : 'from-pink-400 to-rose-500'
          } flex items-center justify-center`}
        >
          <span className="text-4xl">{categoryIcons[prompt.category] || '🎤'}</span>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-medium rounded-full">
              {prompt.level}
            </span>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full capitalize">
              {prompt.category}
            </span>
            {featured && (
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                Featured
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{prompt.title}</h3>

          {/* Prompt Preview */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 italic">"{prompt.promptText}"</p>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                ~{prompt.estimatedTime}s
              </span>
              {prompt.targetWords.length > 0 && (
                <span className="flex items-center gap-1">
                  <Volume2 className="w-3 h-3" />
                  {prompt.targetWords.length} focus words
                </span>
              )}
            </div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-xs ${star <= prompt.difficulty ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
