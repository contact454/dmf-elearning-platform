'use client';

import { useEffect, useState } from 'react';
import { Clock, Target, BookOpen, CheckCircle2 } from 'lucide-react';
import type { SpeakingPrompt } from '@/types/speaking';

interface PromptDisplayProps {
  prompt: SpeakingPrompt;
  onPreparationComplete?: () => void;
  showPreparationTimer?: boolean;
  className?: string;
}

export function PromptDisplay({
  prompt,
  onPreparationComplete,
  showPreparationTimer = true,
  className = '',
}: PromptDisplayProps) {
  const [preparationTimeLeft, setPreparationTimeLeft] = useState(
    showPreparationTimer ? prompt.preparationTimeSeconds : 0
  );
  const [isPreparationComplete, setIsPreparationComplete] = useState(!showPreparationTimer);

  // Preparation timer
  useEffect(() => {
    if (!showPreparationTimer || preparationTimeLeft <= 0) return;

    const interval = setInterval(() => {
      setPreparationTimeLeft((prev) => {
        if (prev <= 1) {
          setIsPreparationComplete(true);
          onPreparationComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showPreparationTimer, preparationTimeLeft, onPreparationComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const cefrColors: Record<string, string> = {
    A1: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    A2: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    B1: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    B2: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    C1: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    C2: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header: Badges */}
      <div className="flex flex-wrap items-center gap-3">
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${cefrColors[prompt.cefrLevel]}`}>
          {prompt.cefrLevel}
        </span>
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
          {prompt.topic}
        </span>
      </div>

      {/* Question */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3">
          <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Speaking Question
            </h3>
            <p className="text-2xl font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
              {prompt.question}
            </p>
          </div>
        </div>
      </div>

      {/* Preparation Timer */}
      {showPreparationTimer && preparationTimeLeft > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Preparation Time
              </span>
            </div>
            <div className="text-3xl font-bold font-mono text-blue-600 dark:text-blue-400">
              {formatTime(preparationTimeLeft)}
            </div>
          </div>
        </div>
      )}

      {/* Preparation Complete */}
      {isPreparationComplete && showPreparationTimer && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-900 dark:text-green-100">
            Preparation complete! You can start speaking now.
          </span>
        </div>
      )}

      {/* Time Limits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
              Preparation Time
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatTime(prompt.preparationTimeSeconds)}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
              Speaking Time Limit
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatTime(prompt.speakingTimeSeconds)}
          </div>
        </div>
      </div>

      {/* Evaluation Criteria */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Evaluation Criteria
        </h4>
        <ul className="space-y-2">
          {prompt.evaluationCriteria.map((criterion, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span>{criterion}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Tips */}
      {prompt.tips && prompt.tips.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-3">
            💡 Tips
          </h4>
          <ul className="space-y-1">
            {prompt.tips.map((tip, index) => (
              <li key={index} className="text-sm text-amber-800 dark:text-amber-200">
                • {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
