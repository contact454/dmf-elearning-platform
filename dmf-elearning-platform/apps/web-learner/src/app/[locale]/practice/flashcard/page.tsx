'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Loader2, RefreshCw, Trophy, Target, Sparkles } from 'lucide-react';
import { FlashcardDeck } from '@/components/flashcard';
import {
  getRandomVocabulary,
  getDbLevels,
  getVocabularyStats,
  type DbVocabularyItem,
  type VocabularyStats,
  GermanApiError,
} from '@/services/german-api';

export default function FlashcardPracticePage() {
  const [words, setWords] = useState<DbVocabularyItem[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [stats, setStats] = useState<VocabularyStats | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [cardCount, setCardCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [practicing, setPracticing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0, total: 0 });

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [levelsData, statsData] = await Promise.all([
          getDbLevels(),
          getVocabularyStats(),
        ]);
        setLevels(levelsData);
        setStats(statsData);
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

  const startPractice = async () => {
    try {
      setLoading(true);
      setError(null);
      const randomWords = await getRandomVocabulary(cardCount, selectedLevel || undefined);
      setWords(randomWords);
      setPracticing(true);
      setSessionComplete(false);
    } catch (err) {
      if (err instanceof GermanApiError) {
        setError(err.message);
      } else {
        setError('Failed to load vocabulary');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = (stats: { correct: number; incorrect: number; total: number }) => {
    setSessionStats(stats);
    setSessionComplete(true);
  };

  const resetPractice = () => {
    setPracticing(false);
    setSessionComplete(false);
    setWords([]);
  };

  // Loading state
  if (loading && !practicing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !practicing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Lỗi kết nối</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-sm text-red-500 mb-4">Hãy đảm bảo Learning Service đang chạy trên port 3003</p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Về Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Session complete
  if (sessionComplete) {
    const percentage = Math.round((sessionStats.correct / sessionStats.total) * 100);
    const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'D';

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <div className="mb-6">
            <Trophy className="w-20 h-20 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Hoàn thành!</h2>
            <p className="text-gray-600">Bạn đã hoàn thành phiên luyện tập</p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
            <div className="text-6xl font-bold text-blue-600 mb-2">{grade}</div>
            <div className="text-lg text-gray-700">{percentage}% chính xác</div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-gray-900">{sessionStats.total}</div>
              <div className="text-sm text-gray-600">Tổng số</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600">{sessionStats.correct}</div>
              <div className="text-sm text-gray-600">Đúng</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-red-600">{sessionStats.incorrect}</div>
              <div className="text-sm text-gray-600">Sai</div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={startPractice}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Luyện tiếp
            </button>
            <button
              onClick={resetPractice}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition"
            >
              Thay đổi cài đặt
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Practice mode
  if (practicing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={resetPractice}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Thoát</span>
              </button>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <span className="font-medium text-gray-900">Luyện Flashcard</span>
              </div>
              <div className="text-sm text-gray-600">
                {selectedLevel || 'Tất cả'} · {words.length} từ
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <FlashcardDeck
            words={words}
            onComplete={handleComplete}
            shuffleOnStart={true}
          />
        </main>
      </div>
    );
  }

  // Setup screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Luyện Flashcard</h1>
              <p className="text-sm text-gray-600">Học từ vựng tiếng Đức với thẻ ghi nhớ</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        {/* Stats Overview */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900">Kho từ vựng</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Tổng từ</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.byLevel.length}</div>
                <div className="text-sm text-gray-600">Cấp độ</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{stats.byTopic.length}</div>
                <div className="text-sm text-gray-600">Chủ đề</div>
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
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Cài đặt luyện tập</h2>

          {/* Level Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn cấp độ
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedLevel('')}
                className={`px-4 py-2 rounded-xl font-medium transition ${
                  selectedLevel === ''
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả
              </button>
              {levels.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-4 py-2 rounded-xl font-medium transition ${
                    selectedLevel === level
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Card Count */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số lượng từ: <span className="text-blue-600 font-bold">{cardCount}</span>
            </label>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={cardCount}
              onChange={(e) => setCardCount(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5</span>
              <span>25</span>
              <span>50</span>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={startPractice}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold text-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Bắt đầu luyện tập
              </>
            )}
          </button>
        </motion.div>
      </main>
    </div>
  );
}
