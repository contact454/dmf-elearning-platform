'use client';

import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Trophy } from 'lucide-react';
import {
  useLeaderboard,
  useUserRankings,
  useLeaderboardStats,
} from '@/hooks/useLeaderboardQueries';
import { useLevels } from '@/hooks/useVocabularySrsQueries';
import { LeaderboardTimeframe, LeaderboardScope } from '@/services/german-api';
import { SkeletonCard, SkeletonStats, ThemeToggle } from '@/components/ui';
import {
  LeaderboardCard,
  LeaderboardFilters,
  UserRankingsCard,
  LeaderboardStatsCards,
} from '@/components/leaderboard';

export default function LeaderboardPage() {
  // Filters
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>('all-time');
  const [scope, setScope] = useState<LeaderboardScope>('global');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Build filters
  const filters = useMemo(
    () => ({
      timeframe,
      scope,
      level: scope === 'level' ? selectedLevel : undefined,
      module: scope === 'module' ? (selectedModule as any) : undefined,
      limit: 100,
    }),
    [timeframe, scope, selectedLevel, selectedModule]
  );

  // Queries
  const {
    data: leaderboardData,
    isLoading: leaderboardLoading,
    error: leaderboardError,
    refetch: refetchLeaderboard,
  } = useLeaderboard(filters);

  const { data: rankings, isLoading: rankingsLoading } = useUserRankings();

  const { data: stats } = useLeaderboardStats(timeframe);

  const { data: levels = [] } = useLevels();

  // Filter entries by search
  const filteredEntries = useMemo(() => {
    if (!leaderboardData?.entries) return [];
    if (!searchQuery) return leaderboardData.entries;

    const query = searchQuery.toLowerCase();
    return leaderboardData.entries.filter(
      (entry) =>
        entry.username.toLowerCase().includes(query) ||
        entry.displayName.toLowerCase().includes(query)
    );
  }, [leaderboardData?.entries, searchQuery]);

  const isLoading = leaderboardLoading && !leaderboardData;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Link href="/learn/hub" className="p-2 hover:bg-gray-100 rounded-lg transition">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-purple-500" />
                  Leaderboard
                </h1>
                <p className="text-sm text-gray-600">Compete with learners worldwide</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SkeletonStats className="mb-8" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/learn/hub" className="p-2 hover:bg-gray-100 rounded-lg transition">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-purple-500" />
                  Leaderboard
                </h1>
                <p className="text-sm text-gray-600">Compete with learners worldwide</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {stats && <LeaderboardStatsCards stats={stats} />}

        {/* Your Rankings Card */}
        {rankings && <UserRankingsCard rankings={rankings} />}

        {/* Filters */}
        <LeaderboardFilters
          timeframe={timeframe}
          scope={scope}
          selectedLevel={selectedLevel}
          selectedModule={selectedModule}
          searchQuery={searchQuery}
          levels={levels}
          onTimeframeChange={setTimeframe}
          onScopeChange={setScope}
          onLevelChange={setSelectedLevel}
          onModuleChange={setSelectedModule}
          onSearchChange={setSearchQuery}
        />

        {/* Leaderboard List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-purple-500" />
              Rankings ({filteredEntries.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            <AnimatePresence mode="popLayout">
              {filteredEntries.map((entry, index) => (
                <LeaderboardCard
                  key={entry.userId}
                  entry={entry}
                  index={index}
                  timeframe={timeframe}
                />
              ))}
            </AnimatePresence>
          </div>

          {filteredEntries.length === 0 && (
            <div className="p-12 text-center">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchQuery
                  ? 'No users found matching your search'
                  : 'No rankings available yet'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>

        {/* Error State */}
        {leaderboardError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">
              Failed to load leaderboard. Please try again.
            </p>
            <button
              onClick={() => refetchLeaderboard()}
              className="mt-2 text-red-600 hover:text-red-700 font-medium text-sm"
            >
              Retry
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
