'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeedbackCard } from './FeedbackCard';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface Sentence {
  id: string;
  text: string;
}

interface Exercise {
  id: string;
  question: string;
  exerciseData: {
    sentences: Sentence[];
    correct_order: string[];
  };
  explanation?: string;
}

interface SequencingExerciseProps {
  exercise: Exercise;
  onComplete: (data: any) => void;
}

export function SequencingExercise({
  exercise,
  onComplete,
}: SequencingExerciseProps) {
  const [items, setItems] = useState<Sentence[]>(() => {
    // Shuffle sentences initially
    const shuffled = [...exercise.exerciseData.sentences];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [accuracyScore, setAccuracyScore] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSubmit = () => {
    const userOrder = items.map((item) => item.id);
    const correctOrder = exercise.exerciseData.correct_order;

    // Exact match
    if (JSON.stringify(userOrder) === JSON.stringify(correctOrder)) {
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
        userAnswer: { order: userOrder },
        isCorrect: true,
      });
      return;
    }

    // Partial credit: count correct positions
    let correctPositions = 0;
    const length = Math.min(correctOrder.length, userOrder.length);

    for (let i = 0; i < length; i++) {
      if (correctOrder[i] === userOrder[i]) {
        correctPositions++;
      }
    }

    const score = Math.round((correctPositions / correctOrder.length) * 100);
    const correct = score === 100;

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
      userAnswer: { order: userOrder },
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
        <span className="text-sm font-medium text-green-600 dark:text-green-400">
          Sequencing
        </span>
      </div>

      <h3 className="question text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        {exercise.question}
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Drag and drop the sentences into the correct order.
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3 mb-6">
            {items.map((item, index) => {
              const correctIndex = exercise.exerciseData.correct_order.indexOf(item.id);
              const isInCorrectPosition = showFeedback && correctIndex === index;
              const isInWrongPosition = showFeedback && correctIndex !== index;

              return (
                <SortableItem
                  key={item.id}
                  id={item.id}
                  text={item.text}
                  index={index}
                  isCorrect={isInCorrectPosition}
                  isWrong={isInWrongPosition}
                  disabled={showFeedback}
                  correctPosition={showFeedback ? correctIndex + 1 : undefined}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {!showFeedback && (
        <Button onClick={handleSubmit} className="w-full" size="lg">
          Check Order
        </Button>
      )}

      {showFeedback && !isCorrect && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Correct Order:
          </h4>
          <ol className="space-y-2">
            {exercise.exerciseData.correct_order.map((id, index) => {
              const sentence = exercise.exerciseData.sentences.find((s) => s.id === id);
              return (
                <li key={id} className="text-blue-800 dark:text-blue-200">
                  <span className="font-medium">{index + 1}.</span> {sentence?.text}
                </li>
              );
            })}
          </ol>
          {accuracyScore > 0 && accuracyScore < 100 && (
            <p className="mt-3 text-sm text-blue-700 dark:text-blue-300">
              You got {accuracyScore}% correct ({accuracyScore / 100 * exercise.exerciseData.correct_order.length} out of {exercise.exerciseData.correct_order.length} in the right position)
            </p>
          )}
        </div>
      )}

      {showFeedback && (
        <FeedbackCard
          isCorrect={isCorrect}
          explanation={exercise.explanation}
          xpEarned={isCorrect ? 10 : Math.floor(accuracyScore / 10)}
          onNext={() => {
            /* Move to next exercise */
          }}
        />
      )}
    </motion.div>
  );
}

interface SortableItemProps {
  id: string;
  text: string;
  index: number;
  isCorrect?: boolean;
  isWrong?: boolean;
  disabled?: boolean;
  correctPosition?: number;
}

function SortableItem({
  id,
  text,
  index,
  isCorrect,
  isWrong,
  disabled,
  correctPosition,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-4 border-2 rounded-lg transition-all',
        !disabled && 'cursor-move hover:border-green-400 hover:bg-green-50/50 dark:hover:bg-green-900/10',
        !isCorrect && !isWrong && 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900',
        isCorrect && 'border-green-500 bg-green-50 dark:bg-green-900/20',
        isWrong && 'border-red-500 bg-red-50 dark:bg-red-900/20',
        disabled && 'cursor-not-allowed'
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className={cn(
          'flex-shrink-0',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-move'
        )}
      >
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>

      <div className="flex-1 flex items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-300">
            {index + 1}
          </span>
          <p className="text-gray-900 dark:text-gray-100">{text}</p>
        </div>

        {isCorrect && (
          <CheckCircle className="flex-shrink-0 h-6 w-6 text-green-600 dark:text-green-400" />
        )}
        {isWrong && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-red-600 dark:text-red-400">
              Should be #{correctPosition}
            </span>
            <XCircle className="flex-shrink-0 h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
        )}
      </div>
    </div>
  );
}
