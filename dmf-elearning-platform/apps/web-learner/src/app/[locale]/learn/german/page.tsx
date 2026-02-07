'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getLevels,
  getTopics,
  getLevelSummary,
  getLevelDisplayName,
  getLevelColor,
  formatTopicName,
  GermanApiError,
  type LevelSummary,
} from '@/services/german-api';
import { Book, Lock, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';

export default function GermanLearningPage() {
  const [levels, setLevels] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [levelSummary, setLevelSummary] = useState<LevelSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available levels on mount
  useEffect(() => {
    async function loadLevels() {
      try {
        setLoading(true);
        const fetchedLevels = await getLevels();
        setLevels(fetchedLevels);

        // Auto-select first level
        if (fetchedLevels.length > 0) {
          setSelectedLevel(fetchedLevels[0]);
        }
      } catch (err) {
        if (err instanceof GermanApiError) {
          setError(err.message);
        } else {
          setError('Failed to load levels. Please check if Learning Service is running.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadLevels();
  }, []);

  // Load topics when level changes
  useEffect(() => {
    if (!selectedLevel) return;

    async function loadTopics() {
      // Double-check for TypeScript
      if (!selectedLevel) return;
      
      try {
        setTopicsLoading(true);
        // Use non-null assertion since we checked above
        const [fetchedTopics, summary] = await Promise.all([
          getTopics(selectedLevel!),
          getLevelSummary(selectedLevel!),
        ]);
        setTopics(fetchedTopics);
        setLevelSummary(summary);
      } catch (err) {
        if (err instanceof GermanApiError) {
          setError(err.message);
        } else {
          setError('Failed to load topics');
        }
      } finally {
        setTopicsLoading(false);
      }
    }

    loadTopics();
  }, [selectedLevel]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading German courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Book className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">German Learning Path</h1>
                <p className="text-sm text-gray-600">Choose your level and start learning</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">
                {levelSummary?.topicCount || 0} Topics Available
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Level Selector */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Your Level</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {levels.map((level) => {
              const color = getLevelColor(level);
              const isSelected = selectedLevel === level;
              const isLocked = false; // TODO: Implement progress tracking

              return (
                <button
                  key={level}
                  onClick={() => !isLocked && setSelectedLevel(level)}
                  disabled={isLocked}
                  className={`
                    relative p-6 rounded-2xl border-2 transition-all duration-200
                    ${isSelected
                      ? `border-${color}-500 bg-${color}-50 shadow-lg scale-105`
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                    }
                    ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {isLocked && (
                    <div className="absolute top-2 right-2">
                      <Lock className="w-4 h-4 text-gray-400" />
                    </div>
                  )}

                  <div className={`
                    w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center
                    ${isSelected ? `bg-${color}-500` : 'bg-gray-100'}
                  `}>
                    <span className={`text-2xl font-bold ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                      {level}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-gray-900 text-center">
                    {getLevelDisplayName(level).split(' ')[0]}
                  </p>
                  <p className="text-xs text-gray-500 text-center mt-1">
                    {getLevelDisplayName(level).split(' ').slice(1).join(' ')}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Topics Grid */}
        {selectedLevel && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {getLevelDisplayName(selectedLevel)} Topics
              </h2>
              {levelSummary && (
                <span className="text-sm text-gray-600">
                  {levelSummary.topicCount} topics
                </span>
              )}
            </div>

            {topicsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : topics.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border-2 border-gray-200">
                <Book className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No topics available yet.</p>
                <p className="text-sm text-gray-500 mt-2">The Data Factory is still generating content.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topics.map((topic, index) => {
                  const color = getLevelColor(selectedLevel);
                  const isCompleted = false; // TODO: Track completion

                  return (
                    <Link
                      key={topic}
                      href={`/learn/german/${selectedLevel}/${encodeURIComponent(topic)}`}
                      className="group relative bg-white rounded-2xl border-2 border-gray-200 p-6
                               hover:border-blue-300 hover:shadow-xl transition-all duration-300
                               text-left overflow-hidden block"
                    >
                      {/* Background gradient on hover */}
                      <div className={`
                        absolute inset-0 bg-gradient-to-br from-${color}-50 to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300
                      `} />

                      {/* Content */}
                      <div className="relative">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`
                            w-12 h-12 rounded-xl flex items-center justify-center
                            bg-gradient-to-br from-${color}-100 to-${color}-200
                            group-hover:scale-110 transition-transform duration-300
                          `}>
                            <Book className={`w-6 h-6 text-${color}-600`} />
                          </div>

                          {isCompleted && (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          )}
                        </div>

                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                          {formatTopicName(topic)}
                        </h3>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className={`
                            px-2 py-1 rounded-full text-xs font-medium
                            bg-${color}-100 text-${color}-700
                          `}>
                            {selectedLevel}
                          </span>
                          <span>•</span>
                          <span>New</span>
                        </div>

                        {/* Progress bar placeholder */}
                        <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-full`}
                            style={{ width: isCompleted ? '100%' : '0%' }}
                          />
                        </div>
                      </div>

                      {/* Hover arrow */}
                      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100
                                    transform translate-x-2 group-hover:translate-x-0 transition-all">
                        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
