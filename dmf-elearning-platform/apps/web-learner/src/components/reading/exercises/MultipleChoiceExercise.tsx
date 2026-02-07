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
    options: string[];
    correct_index: number;
  };
  explanation?: string;
}

interface MultipleChoiceExerciseProps {
  exercise: Exercise;
  onComplete: (data: any) => void;
}

export function MultipleChoiceExercise({
  exercise,
  onComplete,
}: MultipleChoiceExerciseProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    if (selectedIndex === null) return;

    const correct = selectedIndex === exercise.exerciseData.correct_index;
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
      userAnswer: { selected_index: selectedIndex },
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
        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
          Multiple Choice
        </span>
      </div>

      <h3 className="question text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
        {exercise.question}
      </h3>

      <div className="options space-y-3">
        {exercise.exerciseData.options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isCorrectOption =
            index === exercise.exerciseData.correct_index;
          const showCorrect = showFeedback && isCorrectOption;
          const showIncorrect = showFeedback && isSelected && !isCorrect;

          return (
            <label
              key={index}
              className={cn(
                'option flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all',
                isSelected && !showFeedback &&
                  'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
                !isSelected &&
                  !showFeedback &&
                  'border-gray-300 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10',
                showCorrect &&
                  'border-green-500 bg-green-50 dark:bg-green-900/20',
                showIncorrect &&
                  'border-red-500 bg-red-50 dark:bg-red-900/20'
              )}
            >
              <input
                type="radio"
                name="answer"
                value={index}
                checked={isSelected}
                onChange={() => setSelectedIndex(index)}
                disabled={showFeedback}
                className="sr-only"
              />

              <span className="flex-1 text-gray-900 dark:text-gray-100">
                {option}
              </span>

              {showCorrect && (
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              )}
              {showIncorrect && (
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              )}
            </label>
          );
        })}
      </div>

      {!showFeedback && (
        <Button
          onClick={handleSubmit}
          disabled={selectedIndex === null}
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
