'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Shuffle, Check, X, Loader2 } from 'lucide-react';
import { Flashcard } from './Flashcard';
import type { DbVocabularyItem } from '@/services/german-api';

interface FlashcardDeckProps {
  words: DbVocabularyItem[];
  onComplete?: (stats: { correct: number; incorrect: number; total: number }) => void;
  showProgress?: boolean;
  shuffleOnStart?: boolean;
}

export function FlashcardDeck({
  words: initialWords,
  onComplete,
  showProgress = true,
  shuffleOnStart = false,
}: FlashcardDeckProps) {
  const [words, setWords] = useState<DbVocabularyItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 });
  const [answered, setAnswered] = useState<Set<number>>(new Set());
  const [isFlipped, setIsFlipped] = useState(false);

  // Initialize and optionally shuffle words
  useEffect(() => {
    if (shuffleOnStart) {
      setWords([...initialWords].sort(() => Math.random() - 0.5));
    } else {
      setWords(initialWords);
    }
  }, [initialWords, shuffleOnStart]);

  const currentWord = words[currentIndex];
  const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;
  const isCompleted = answered.size === words.length;

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : words.length - 1));
    setIsFlipped(false);
  }, [words.length]);

  const goToNext = useCallback(() => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else if (isCompleted && onComplete) {
      onComplete({ ...stats, total: words.length });
    }
  }, [currentIndex, words.length, isCompleted, onComplete, stats]);

  const toggleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const markCorrect = useCallback(() => {
    if (!answered.has(currentIndex)) {
      setStats((prev) => ({ ...prev, correct: prev.correct + 1 }));
      setAnswered((prev) => new Set(prev).add(currentIndex));
    }
    goToNext();
  }, [currentIndex, answered, goToNext]);

  const markIncorrect = useCallback(() => {
    if (!answered.has(currentIndex)) {
      setStats((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
      setAnswered((prev) => new Set(prev).add(currentIndex));
    }
    goToNext();
  }, [currentIndex, answered, goToNext]);

  const shuffleDeck = useCallback(() => {
    setWords((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setStats({ correct: 0, incorrect: 0 });
    setAnswered(new Set());
    setIsFlipped(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        toggleFlip();
      } else if (e.key === '1' || e.key === 'j') {
        markCorrect();
      } else if (e.key === '2' || e.key === 'k') {
        markIncorrect();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [goToPrevious, goToNext, markCorrect, markIncorrect, toggleFlip]);

  if (words.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Bar */}
      {showProgress && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {currentIndex + 1} / {words.length}
            </span>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-600 font-medium">
                <Check className="w-4 h-4 inline mr-1" />
                {stats.correct}
              </span>
              <span className="text-red-600 font-medium">
                <X className="w-4 h-4 inline mr-1" />
                {stats.incorrect}
              </span>
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
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
            word={currentWord}
            isFlipped={isFlipped}
            onFlip={setIsFlipped}
          />
        </motion.div>
      </AnimatePresence>

      {/* Answer Buttons */}
      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          onClick={markIncorrect}
          className="flex items-center gap-2 px-6 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors font-medium"
        >
          <X className="w-5 h-5" />
          <span>Chưa nhớ</span>
          <kbd className="ml-2 px-1.5 py-0.5 bg-red-200 rounded text-xs">K</kbd>
        </button>

        <button
          onClick={markCorrect}
          className="flex items-center gap-2 px-6 py-3 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl transition-colors font-medium"
        >
          <Check className="w-5 h-5" />
          <span>Đã nhớ</span>
          <kbd className="ml-2 px-1.5 py-0.5 bg-green-200 rounded text-xs">J</kbd>
        </button>
      </div>

      {/* Navigation Controls */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          onClick={goToPrevious}
          className="p-3 bg-white border-2 border-gray-200 rounded-full hover:border-blue-300 hover:bg-blue-50 transition group"
          aria-label="Previous card"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
        </button>

        <button
          onClick={shuffleDeck}
          className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-full hover:border-purple-300 hover:bg-purple-50 transition group"
        >
          <Shuffle className="w-4 h-4 text-gray-600 group-hover:text-purple-600" />
          <span className="text-sm text-gray-600 group-hover:text-purple-600">Trộn bài</span>
        </button>

        <button
          onClick={goToNext}
          className="p-3 bg-white border-2 border-gray-200 rounded-full hover:border-blue-300 hover:bg-blue-50 transition group"
          aria-label="Next card"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
        </button>
      </div>

      {/* Keyboard Hints */}
      <div className="mt-6 flex justify-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">←</kbd>
          <span>Trước</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">→</kbd>
          <span>Sau</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">Space</kbd>
          <span>Lật thẻ</span>
        </div>
      </div>
    </div>
  );
}

export default FlashcardDeck;
