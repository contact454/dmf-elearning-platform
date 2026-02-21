'use client';

import { useState, useEffect } from 'react';
import { Flashcard } from '@/components/vocabulary/Flashcard';
import { useDueCards, useSubmitReview } from '@/hooks/useVocabularySrsQueries';
import { SkeletonFlashcard } from '@/components/ui/skeleton';
import { SRSRating } from '@/services/german-api';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function VocabularyReviewPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    reviewed: 0,
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });
  const [isComplete, setIsComplete] = useState(false);

  // React Query hooks
  const {
    data: cards,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useDueCards(20); // Fetch 20 due cards

  const submitReviewMutation = useSubmitReview();

  // Update total cards count when cards are loaded
  useEffect(() => {
    if (cards && cards.length > 0) {
      setStats((prev) => ({ ...prev, total: cards.length }));
    }
  }, [cards]);

  const handleRate = async (rating: SRSRating) => {
    if (!cards || cards.length === 0) return;

    const currentCard = cards[currentIndex];
    const ratingNames = ['again', 'hard', 'good', 'easy'] as const;
    const ratingKey = ratingNames[rating];

    // Update local stats immediately for better UX
    setStats((prev) => ({
      ...prev,
      reviewed: prev.reviewed + 1,
      [ratingKey]: prev[ratingKey] + 1,
    }));

    // Submit to backend (fire and forget for now - mutation handles cache invalidation)
    try {
      await submitReviewMutation.mutateAsync({
        vocabId: currentCard.id,
        rating,
      });
    } catch (err) {
      console.error('Failed to submit review:', err);
      // Note: We don't roll back the UI since the card is still "reviewed"
      // User can retry later with refetch
    }

    // Move to next card
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setStats({
      total: cards?.length || 0,
      reviewed: 0,
      again: 0,
      hard: 0,
      good: 0,
      easy: 0,
    });
    setIsComplete(false);
    refetch(); // Fetch new due cards
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              📚 Loading Vocabulary Cards...
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Fetching your due cards from the backend
            </p>
          </div>
          <SkeletonFlashcard />
          <div className="mt-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state with retry option
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-3xl p-8 max-w-md text-center shadow-xl">
          <div className="mb-4">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-red-800 dark:text-red-400 mb-2">
            Connection Error
          </h2>
          <p className="text-red-600 dark:text-red-300 mb-6">
            Failed to load vocabulary cards. Please check if the backend is running on{' '}
            <code className="bg-red-100 dark:bg-red-900/50 px-2 py-1 rounded">
              http://localhost:3003/api
            </code>
          </p>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Retrying...' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  // No cards available
  if (!cards || cards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-8">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            All Caught Up!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            No vocabulary cards are due for review right now. Great job!
          </p>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Checking...' : 'Check Again'}
          </button>
        </div>
      </div>
    );
  }

  // Review complete
  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-8">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Review Complete!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            You reviewed {stats.reviewed} cards
          </p>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {stats.again}
              </div>
              <div className="text-sm text-red-700 dark:text-red-300">Again</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {stats.hard}
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300">Hard</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.good}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">Good</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.easy}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Easy</div>
            </div>
          </div>

          <button
            onClick={handleRestart}
            disabled={isFetching}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Loading...' : 'Review More Cards'}
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              📚 Vocabulary Review
            </h1>
            <div className="flex items-center gap-4">
              <div className="text-lg font-medium text-gray-600 dark:text-gray-400">
                {currentIndex + 1} / {cards.length}
              </div>
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
                title="Refresh cards"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${isFetching ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <Flashcard
          word={currentCard.word}
          meaning={currentCard.meaning_vi}
          level={currentCard.level}
          example={
            currentCard.example_de && currentCard.example_vi
              ? `${currentCard.example_de}\n${currentCard.example_vi}`
              : undefined
          }
          onRate={handleRate}
        />

        {/* Session Stats */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">
            Session Stats
          </h3>
          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-red-600 dark:text-red-400 font-bold">
                {stats.again}
              </span>{' '}
              <span className="text-gray-600 dark:text-gray-400">Again</span>
            </div>
            <div>
              <span className="text-orange-600 dark:text-orange-400 font-bold">
                {stats.hard}
              </span>{' '}
              <span className="text-gray-600 dark:text-gray-400">Hard</span>
            </div>
            <div>
              <span className="text-green-600 dark:text-green-400 font-bold">
                {stats.good}
              </span>{' '}
              <span className="text-gray-600 dark:text-gray-400">Good</span>
            </div>
            <div>
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                {stats.easy}
              </span>{' '}
              <span className="text-gray-600 dark:text-gray-400">Easy</span>
            </div>
          </div>

          {/* Submission status indicator */}
          {submitReviewMutation.isPending && (
            <div className="mt-4 text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-blue-500"></div>
              Saving review...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
