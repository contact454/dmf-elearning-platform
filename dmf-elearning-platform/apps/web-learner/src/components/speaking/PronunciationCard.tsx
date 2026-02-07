'use client';

import { Play } from 'lucide-react';
import type { PronunciationFeedback } from '@/types/speaking';

interface PronunciationCardProps {
  feedback: PronunciationFeedback;
  onPlayAudio?: () => void;
  className?: string;
}

export function PronunciationCard({
  feedback,
  onPlayAudio,
  className = '',
}: PronunciationCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
  };

  const getScoreBorderColor = (score: number) => {
    if (score >= 80) return 'border-green-200 dark:border-green-800';
    if (score >= 60) return 'border-yellow-200 dark:border-yellow-800';
    return 'border-red-200 dark:border-red-800';
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg p-4 border-2 ${getScoreBorderColor(
        feedback.accuracyScore
      )} ${className}`}
    >
      {/* Header: Word and Score */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {feedback.word}
        </h4>
        <div
          className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(
            feedback.accuracyScore
          )}`}
        >
          {feedback.accuracyScore}%
        </div>
      </div>

      {/* IPA Comparison */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Expected
          </p>
          <p className="font-mono text-lg text-gray-900 dark:text-gray-100">
            /{feedback.expectedIPA}/
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Your pronunciation
          </p>
          <p className="font-mono text-lg text-gray-900 dark:text-gray-100">
            /{feedback.actualIPA}/
          </p>
        </div>
      </div>

      {/* Feedback Text */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded p-3 mb-3">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {feedback.feedback}
        </p>
      </div>

      {/* Play Audio Button */}
      {feedback.audioSnippetUrl && (
        <button
          onClick={onPlayAudio}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Play className="w-4 h-4" />
          Play Audio Snippet
        </button>
      )}

      {/* Position Info */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Position: {feedback.position.start.toFixed(2)}s - {feedback.position.end.toFixed(2)}s
      </div>
    </div>
  );
}
