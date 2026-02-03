'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  Brain,
  Zap,
  Clock,
  Trophy,
  Target,
  TrendingUp,
} from 'lucide-react';
import { SRSFlashcardDeck } from '@/components/flashcard/SRSFlashcardDeck';
import {
  getDbLevels,
  getUserProgress,
  type UserProgressStats,
  GermanApiError,
} from '@/services/german-api';

// Temporary user ID - In production, this would come from auth
const TEMP_USER_ID = 'demo-user-001';

export default function SRSPracticePage() {
  const [levels, setLevels] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [progress, setProgress] = useState<UserProgressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [practicing, setPracticing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [levelsData, progressData] = await Promise.all([
          getDbLevels(),
          getUserProgress(TEMP_USER_ID),
        ]);
        setLevels(levelsData);
        setProgress(progressData);
      } catch (err) {
        if (err instanceof GermanApiError) {
          setError(err.message);
        } else {
          setError('Failed to load data. Is the Learning Service running?');
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const startPractice = () => {
    setPracticing(true);
  };

  const handleComplete = async (stats: UserProgressStats) => {
    setProgress(stats);
    setPracticing(false);
  };

  const exitPractice = () => {
    setPracticing(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">Loading your progress...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !practicing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Connection Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-sm text-red-500 mb-4">Make sure Learning Service is running on port 3003</p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Practice mode
  if (practicing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={exitPractice}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Exit</span>
              </button>
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-500" />
                <span className="font-medium text-gray-900">SRS Review</span>
              </div>
              <div className="text-sm text-gray-600">
                {selectedLevel || 'All Levels'}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <SRSFlashcardDeck
            userId={TEMP_USER_ID}
            level={selectedLevel || undefined}
            onComplete={handleComplete}
          />
        </main>
      </div>
    );
  }

  // Setup screen with progress overview
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Smart Review (SRS)</h1>
              <p className="text-sm text-gray-600">Spaced Repetition for optimal learning</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        {/* Progress Overview */}
        {progress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-indigo-500" />
              <h2 className="text-lg font-semibold text-gray-900">Your Progress</h2>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard
                icon={<Target className="w-5 h-5" />}
                label="Total Cards"
                value={progress.totalCards}
                color="blue"
              />
              <StatCard
                icon={<Clock className="w-5 h-5" />}
                label="Due Today"
                value={progress.dueToday}
                color="orange"
                highlight={progress.dueToday > 0}
              />
              <StatCard
                icon={<Zap className="w-5 h-5" />}
                label="Mastered"
                value={progress.masteredCards}
                color="green"
              />
              <StatCard
                icon={<Trophy className="w-5 h-5" />}
                label="Streak"
                value={`${progress.streak} days`}
                color="purple"
              />
            </div>

            {/* Progress Bars */}
            <div className="space-y-3">
              <ProgressBar
                label="New"
                value={progress.newCards}
                total={progress.totalCards}
                color="gray"
              />
              <ProgressBar
                label="Learning"
                value={progress.learningCards}
                total={progress.totalCards}
                color="blue"
              />
              <ProgressBar
                label="Review"
                value={progress.reviewCards}
                total={progress.totalCards}
                color="yellow"
              />
              <ProgressBar
                label="Mastered"
                value={progress.masteredCards}
                total={progress.totalCards}
                color="green"
              />
            </div>

            {/* Retention Rate */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Retention Rate</span>
                <span className="text-lg font-bold text-indigo-600">
                  {progress.averageRetention}%
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Practice Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Start Review Session</h2>

          {/* Level Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Level (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedLevel('')}
                className={`px-4 py-2 rounded-xl font-medium transition ${
                  selectedLevel === ''
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {levels.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-4 py-2 rounded-xl font-medium transition ${
                    selectedLevel === level
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* How SRS Works */}
          <div className="bg-indigo-50 rounded-xl p-4 mb-8">
            <h3 className="font-medium text-indigo-900 mb-2">How SRS Works</h3>
            <ul className="text-sm text-indigo-700 space-y-1">
              <li>Rate each card: Again, Hard, Good, or Easy</li>
              <li>Cards you know well appear less often</li>
              <li>Difficult cards are reviewed more frequently</li>
              <li>Optimal intervals are calculated automatically</li>
            </ul>
          </div>

          {/* Start Button */}
          <button
            onClick={startPractice}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold text-lg transition flex items-center justify-center gap-2"
          >
            <Brain className="w-5 h-5" />
            Start Review
            {progress && progress.dueToday > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-sm">
                {progress.dueToday} due
              </span>
            )}
          </button>
        </motion.div>

        {/* Link to regular flashcard */}
        <div className="mt-6 text-center">
          <Link
            href="/practice/flashcard"
            className="text-gray-600 hover:text-indigo-600 transition text-sm"
          >
            Or try regular Flashcard practice (no SRS)
          </Link>
        </div>
      </main>
    </div>
  );
}

// Helper components
function StatCard({
  icon,
  label,
  value,
  color,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  highlight?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    orange: 'bg-orange-50 text-orange-700',
    purple: 'bg-purple-50 text-purple-700',
  };

  return (
    <div className={`p-4 rounded-xl ${colorClasses[color]} ${highlight ? 'ring-2 ring-orange-400 ring-offset-2' : ''}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs font-medium opacity-80">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function ProgressBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  const colorClasses: Record<string, string> = {
    gray: 'bg-gray-400',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{value}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colorClasses[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </div>
    </div>
  );
}
