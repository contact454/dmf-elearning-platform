'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Shuffle, Loader2, RotateCcw, Zap, Clock, Trophy } from 'lucide-react';
import { Flashcard } from './Flashcard';
import {
  VocabularyWithProgress,
  SRSRating,
  getDueCards,
  submitReview,
  getUserProgress,
  UserProgressStats,
  getRatingInfo,
} from '@/services/german-api';

interface SRSFlashcardDeckProps {
  userId: string;
  level?: string;
  onComplete?: (stats: UserProgressStats) => void;
  showProgress?: boolean;
}

const RATING_BUTTONS: { rating: SRSRating; key: string }[] = [
  { rating: 0, key: '1' },
  { rating: 1, key: '2' },
  { rating: 2, key: '3' },
  { rating: 3, key: '4' },
];

export function SRSFlashcardDeck({
  userId,
  level,
  onComplete,
  showProgress = true,
}: SRSFlashcardDeckProps) {
  const [cards, setCards] = useState<VocabularyWithProgress[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0 });
  const [userProgress, setUserProgress] = useState<UserProgressStats | null>(null);

  // Fetch due cards on mount
  useEffect(() => {
    async function fetchCards() {
      setIsLoading(true);
      try {
        const [dueCards, progress] = await Promise.all([
          getDueCards(userId, 20, level),
          getUserProgress(userId),
        ]);
        setCards(dueCards);
        setUserProgress(progress);
      } catch (error) {
        console.error('Failed to fetch due cards:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCards();
  }, [userId, level]);

  const currentCard = cards[currentIndex];
  const progress = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;
  const isCompleted = currentIndex >= cards.length && cards.length > 0;

  const handleRating = useCallback(async (rating: SRSRating) => {
    if (!currentCard || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await submitReview(userId, currentCard.id, rating);

      // Update session stats
      setSessionStats(prev => ({
        reviewed: prev.reviewed + 1,
        correct: rating >= 2 ? prev.correct + 1 : prev.correct,
      }));

      // Move to next card
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsFlipped(false);
      } else {
        // Session complete
        const updatedProgress = await getUserProgress(userId);
        setUserProgress(updatedProgress);
        if (onComplete) {
          onComplete(updatedProgress);
        }
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentCard, currentIndex, cards.length, userId, isSubmitting, onComplete]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const toggleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const restartSession = useCallback(async () => {
    setIsLoading(true);
    setCurrentIndex(0);
    setSessionStats({ reviewed: 0, correct: 0 });
    setIsFlipped(false);
    try {
      const dueCards = await getDueCards(userId, 20, level);
      setCards(dueCards);
    } catch (error) {
      console.error('Failed to refresh cards:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, level]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        toggleFlip();
      } else if (['1', '2', '3', '4'].includes(e.key) && isFlipped) {
        const rating = parseInt(e.key) - 1;
        handleRating(rating as SRSRating);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [goToPrevious, toggleFlip, handleRating, isFlipped]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-gray-600">Loading your review cards...</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-2">All caught up!</h2>
          <p className="text-green-600">No cards due for review right now.</p>
        </div>
        {userProgress && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 w-full max-w-2xl">
            <StatCard icon={<Zap />} label="Mastered" value={userProgress.masteredCards} color="green" />
            <StatCard icon={<Clock />} label="Learning" value={userProgress.learningCards} color="blue" />
            <StatCard icon={<RotateCcw />} label="Review" value={userProgress.reviewCards} color="yellow" />
            <StatCard icon={<Trophy />} label="Streak" value={`${userProgress.streak} days`} color="purple" />
          </div>
        )}
        <button
          onClick={restartSession}
          className="mt-4 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
        >
          Check for new cards
        </button>
      </div>
    );
  }

  if (isCompleted) {
    const accuracy = sessionStats.reviewed > 0
      ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100)
      : 0;

    return (
      <div className="flex flex-col items-center justify-center p-12 gap-6 bg-gradient-to-br from-indigo-50 to-purple-100 rounded-3xl">
        <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-indigo-800 mb-2">Session Complete!</h2>
          <p className="text-indigo-600">
            You reviewed {sessionStats.reviewed} cards with {accuracy}% accuracy
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center p-4 bg-white/80 rounded-xl">
            <p className="text-3xl font-bold text-green-600">{sessionStats.correct}</p>
            <p className="text-sm text-gray-600">Correct</p>
          </div>
          <div className="text-center p-4 bg-white/80 rounded-xl">
            <p className="text-3xl font-bold text-orange-600">{sessionStats.reviewed - sessionStats.correct}</p>
            <p className="text-sm text-gray-600">Need Review</p>
          </div>
        </div>
        <button
          onClick={restartSession}
          className="mt-4 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors"
        >
          Start New Session
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Bar & Stats */}
      {showProgress && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {currentIndex + 1} / {cards.length}
            </span>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-600 font-medium">
                <Zap className="w-4 h-4 inline mr-1" />
                {sessionStats.correct}
              </span>
              <span className="text-blue-600 font-medium">
                <RotateCcw className="w-4 h-4 inline mr-1" />
                {sessionStats.reviewed}
              </span>
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Card Status Badge */}
      {currentCard?.progress && (
        <div className="flex justify-center mb-4">
          <StatusBadge status={currentCard.progress.status} />
        </div>
      )}

      {/* Flashcard with Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.2 }}
        >
          <Flashcard
            word={currentCard}
            isFlipped={isFlipped}
            onFlip={setIsFlipped}
          />
        </motion.div>
      </AnimatePresence>

      {/* SRS Rating Buttons */}
      <div className="mt-8">
        {isFlipped ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-gray-600 font-medium">How well did you know this?</p>
            <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
              {RATING_BUTTONS.map(({ rating, key }) => {
                const info = getRatingInfo(rating);
                return (
                  <button
                    key={rating}
                    onClick={() => handleRating(rating)}
                    disabled={isSubmitting}
                    className={`flex flex-col items-center gap-1 px-4 sm:px-6 py-3 rounded-xl transition-all font-medium disabled:opacity-50 ${getRatingButtonStyle(rating)}`}
                  >
                    <span className="text-sm sm:text-base">{info.label}</span>
                    <kbd className="px-1.5 py-0.5 text-xs rounded opacity-60">{key}</kbd>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={toggleFlip}
              className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors shadow-lg hover:shadow-xl"
            >
              Show Answer
              <kbd className="ml-3 px-2 py-1 bg-indigo-400 rounded text-sm">Space</kbd>
            </button>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className="p-3 bg-white border-2 border-gray-200 rounded-full hover:border-blue-300 hover:bg-blue-50 transition group disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous card"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
        </button>

        <button
          onClick={restartSession}
          className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-full hover:border-purple-300 hover:bg-purple-50 transition group"
        >
          <Shuffle className="w-4 h-4 text-gray-600 group-hover:text-purple-600" />
          <span className="text-sm text-gray-600 group-hover:text-purple-600">Refresh</span>
        </button>
      </div>

      {/* Keyboard Hints */}
      <div className="mt-6 flex justify-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">←</kbd>
          <span>Previous</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">Space</kbd>
          <span>Flip</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">1-4</kbd>
          <span>Rate</span>
        </div>
      </div>
    </div>
  );
}

// Helper components
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  const colorClasses: Record<string, string> = {
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    purple: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className={`p-4 rounded-xl ${colorClasses[color]} text-center`}>
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm opacity-80">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusColors: Record<string, string> = {
    new: 'bg-gray-100 text-gray-700 border-gray-300',
    learning: 'bg-blue-100 text-blue-700 border-blue-300',
    review: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    mastered: 'bg-green-100 text-green-700 border-green-300',
  };

  const statusLabels: Record<string, string> = {
    new: 'New',
    learning: 'Learning',
    review: 'Review',
    mastered: 'Mastered',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[status] || statusColors.new}`}>
      {statusLabels[status] || status}
    </span>
  );
}

function getRatingButtonStyle(rating: SRSRating): string {
  const styles: Record<SRSRating, string> = {
    0: 'bg-red-100 hover:bg-red-200 text-red-700 border-2 border-red-200',
    1: 'bg-orange-100 hover:bg-orange-200 text-orange-700 border-2 border-orange-200',
    2: 'bg-blue-100 hover:bg-blue-200 text-blue-700 border-2 border-blue-200',
    3: 'bg-green-100 hover:bg-green-200 text-green-700 border-2 border-green-200',
  };
  return styles[rating];
}

export default SRSFlashcardDeck;
