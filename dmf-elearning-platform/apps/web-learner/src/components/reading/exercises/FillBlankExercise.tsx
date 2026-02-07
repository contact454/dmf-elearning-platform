'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeedbackCard } from './FeedbackCard';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface Exercise {
  id: string;
  question: string;
  exerciseData: {
    sentence: string;
    correct_answer: string;
    alternatives?: string[];
    word_bank?: string[];
  };
  explanation?: string;
}

interface FillBlankExerciseProps {
  exercise: Exercise;
  onComplete: (data: any) => void;
}

export function FillBlankExercise({
  exercise,
  onComplete,
}: FillBlankExerciseProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [accuracyScore, setAccuracyScore] = useState(0);

  // Fuzzy matching (Levenshtein similarity)
  const levenshteinDistance = (str1: string, str2: string): number => {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }

    return dp[m][n];
  };

  const levenshteinSimilarity = (str1: string, str2: string): number => {
    const maxLen = Math.max(str1.length, str2.length);
    if (maxLen === 0) return 1.0;
    const distance = levenshteinDistance(str1, str2);
    return (maxLen - distance) / maxLen;
  };

  const handleSubmit = () => {
    if (!userAnswer.trim()) return;

    const userAnswerLower = userAnswer.trim().toLowerCase();
    const correctAnswerLower = exercise.exerciseData.correct_answer.toLowerCase();

    // Exact match
    if (userAnswerLower === correctAnswerLower) {
      setIsCorrect(true);
      setAccuracyScore(100);
      setShowFeedback(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      onComplete({
        exerciseId: exercise.id,
        userAnswer: { answer: userAnswer },
        isCorrect: true,
      });
      return;
    }

    // Check alternatives
    if (exercise.exerciseData.alternatives?.some(alt => alt.toLowerCase() === userAnswerLower)) {
      setIsCorrect(true);
      setAccuracyScore(100);
      setShowFeedback(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      onComplete({
        exerciseId: exercise.id,
        userAnswer: { answer: userAnswer },
        isCorrect: true,
      });
      return;
    }

    // Fuzzy match (85% similarity threshold)
    const similarity = levenshteinSimilarity(userAnswerLower, correctAnswerLower);
    const score = Math.round(similarity * 100);
    const correct = similarity >= 0.85;

    setIsCorrect(correct);
    setAccuracyScore(score);
    setShowFeedback(true);

    if (correct) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    onComplete({
      exerciseId: exercise.id,
      userAnswer: { answer: userAnswer },
      isCorrect: correct,
    });
  };

  const handleWordBankClick = (word: string) => {
    if (!showFeedback) {
      setUserAnswer(word);
    }
  };

  return (
    <motion.div
      className="exercise-container bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="exercise-header mb-4">
        <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
          Fill in the Blank
        </span>
      </div>

      <h3 className="question text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        {exercise.question}
      </h3>

      <div className="sentence bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg mb-6 border-l-4 border-orange-500">
        <p className="text-lg text-gray-900 dark:text-gray-100">
          {exercise.exerciseData.sentence.split('_____').map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <span className="inline-flex items-center">
                  <span className="inline-block min-w-[120px] mx-2 px-3 py-1 border-b-2 border-dashed border-orange-500 text-orange-600 dark:text-orange-400 font-medium">
                    {showFeedback ? exercise.exerciseData.correct_answer : userAnswer || '___'}
                  </span>
                </span>
              )}
            </span>
          ))}
        </p>
      </div>

      {/* Word Bank */}
      {exercise.exerciseData.word_bank && exercise.exerciseData.word_bank.length > 0 && (
        <div className="word-bank mb-6">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Word Bank:
          </p>
          <div className="flex flex-wrap gap-2">
            {exercise.exerciseData.word_bank.map((word, index) => (
              <button
                key={index}
                onClick={() => handleWordBankClick(word)}
                disabled={showFeedback}
                className={cn(
                  'px-4 py-2 rounded-lg border-2 transition-all',
                  userAnswer === word && !showFeedback
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                    : 'border-gray-300 dark:border-gray-700 hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-900/10 text-gray-700 dark:text-gray-300',
                  showFeedback && 'opacity-50 cursor-not-allowed'
                )}
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Text Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Answer:
        </label>
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          disabled={showFeedback}
          placeholder="Type your answer here..."
          className={cn(
            'w-full px-4 py-3 rounded-lg border-2 transition-all',
            'text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900',
            showFeedback && isCorrect && 'border-green-500 bg-green-50 dark:bg-green-900/20',
            showFeedback && !isCorrect && 'border-red-500 bg-red-50 dark:bg-red-900/20',
            !showFeedback && 'border-gray-300 dark:border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900/30'
          )}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !showFeedback) {
              handleSubmit();
            }
          }}
        />
        {showFeedback && !isCorrect && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Correct answer: <span className="font-medium text-green-600 dark:text-green-400">{exercise.exerciseData.correct_answer}</span>
            {accuracyScore > 0 && accuracyScore < 85 && (
              <span className="ml-2">({accuracyScore}% similar - needs ≥85%)</span>
            )}
          </p>
        )}
      </div>

      {!showFeedback && (
        <Button
          onClick={handleSubmit}
          disabled={!userAnswer.trim()}
          className="w-full"
          size="lg"
        >
          Check Answer
        </Button>
      )}

      {showFeedback && (
        <FeedbackCard
          isCorrect={isCorrect}
          explanation={exercise.explanation}
          xpEarned={isCorrect ? 10 : 0}
          onNext={() => {
            /* Move to next exercise */
          }}
        />
      )}
    </motion.div>
  );
}
