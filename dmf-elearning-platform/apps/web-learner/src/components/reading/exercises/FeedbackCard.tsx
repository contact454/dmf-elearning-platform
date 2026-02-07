'use client';

import { motion } from 'framer-motion';
import { CheckCircle, XCircle, ChevronRight, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FeedbackCardProps {
  isCorrect: boolean;
  explanation?: string;
  xpEarned: number;
  onNext: () => void;
}

export function FeedbackCard({
  isCorrect,
  explanation,
  xpEarned,
  onNext,
}: FeedbackCardProps) {
  return (
    <motion.div
      className={cn(
        'mt-6 p-6 rounded-lg border-2',
        isCorrect
          ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
          : 'bg-red-50 dark:bg-red-900/20 border-red-500'
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {isCorrect ? (
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
            <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
          </div>
        ) : (
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
            <XCircle className="h-7 w-7 text-red-600 dark:text-red-400" />
          </div>
        )}

        <div className="flex-1">
          <h4
            className={cn(
              'text-xl font-bold mb-1',
              isCorrect
                ? 'text-green-900 dark:text-green-100'
                : 'text-red-900 dark:text-red-100'
            )}
          >
            {isCorrect ? 'Correct! Well done! 🎉' : 'Not quite right'}
          </h4>
          <p
            className={cn(
              'text-sm',
              isCorrect
                ? 'text-green-700 dark:text-green-300'
                : 'text-red-700 dark:text-red-300'
            )}
          >
            {isCorrect
              ? "Great job! You're making progress."
              : "Don't worry, learning takes practice!"}
          </p>
        </div>
      </div>

      {/* XP Badge */}
      {xpEarned > 0 && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg">
          <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            +{xpEarned} XP
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            earned!
          </span>
        </div>
      )}

      {/* Explanation */}
      {explanation && (
        <div className="mb-4">
          <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Explanation:
          </h5>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {explanation}
          </p>
        </div>
      )}

      {/* Next Button */}
      <Button
        onClick={onNext}
        className="w-full"
        size="lg"
        variant={isCorrect ? 'default' : 'outline'}
      >
        Continue
        <ChevronRight className="ml-2 h-5 w-5" />
      </Button>
    </motion.div>
  );
}
