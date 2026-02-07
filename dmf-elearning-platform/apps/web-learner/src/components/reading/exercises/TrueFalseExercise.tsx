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
    statement: string;
    is_true: boolean;
  };
  explanation?: string;
}

interface TrueFalseExerciseProps {
  exercise: Exercise;
  onComplete: (data: any) => void;
}

export function TrueFalseExercise({
  exercise,
  onComplete,
}: TrueFalseExerciseProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    const correct = selectedAnswer === exercise.exerciseData.is_true;
    setIsCorrect(correct);
    setShowFeedback(true);

    // Confetti if correct
    if (correct) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    // Notify parent
    onComplete({
      exerciseId: exercise.id,
      userAnswer: { answer: selectedAnswer },
      isCorrect: correct,
    });
  };

  return (
    <motion.div
      className="exercise-container bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="exercise-header mb-4">
        <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
          True / False
        </span>
      </div>

      <h3 className="question text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        {exercise.question}
      </h3>

      <div className="statement bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg mb-6 border-l-4 border-purple-500">
        <p className="text-gray-900 dark:text-gray-100 italic">
          "{exercise.exerciseData.statement}"
        </p>
      </div>

      <div className="options grid grid-cols-2 gap-4">
        {[
          { value: true, label: 'True', color: 'green' },
          { value: false, label: 'False', color: 'red' },
        ].map(({ value, label, color }) => {
          const isSelected = selectedAnswer === value;
          const isCorrectOption = value === exercise.exerciseData.is_true;
          const showCorrect = showFeedback && isCorrectOption;
          const showIncorrect = showFeedback && isSelected && !isCorrect;

          return (
            <button
              key={label}
              onClick={() => !showFeedback && setSelectedAnswer(value)}
              disabled={showFeedback}
              className={cn(
                'option p-6 border-2 rounded-lg transition-all font-semibold text-lg',
                isSelected && !showFeedback &&
                  `border-${color}-500 bg-${color}-50 dark:bg-${color}-900/20`,
                !isSelected &&
                  !showFeedback &&
                  'border-gray-300 dark:border-gray-700 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/30',
                showCorrect &&
                  'border-green-500 bg-green-50 dark:bg-green-900/20',
                showIncorrect &&
                  'border-red-500 bg-red-50 dark:bg-red-900/20'
              )}
            >
              <div className="flex items-center justify-center gap-3">
                <span className={cn(
                  'text-gray-900 dark:text-gray-100',
                  showCorrect && 'text-green-700 dark:text-green-300',
                  showIncorrect && 'text-red-700 dark:text-red-300'
                )}>
                  {label}
                </span>
                {showCorrect && (
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                )}
                {showIncorrect && (
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {!showFeedback && (
        <Button
          onClick={handleSubmit}
          disabled={selectedAnswer === null}
          className="w-full mt-6"
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
